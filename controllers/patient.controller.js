import Patient from "../models/patient.models.js"
import Visit from "../models/visits.modals.js";
import {visitSearchQuery , patientSearchQuery} from "../utils/buildSearchQuery.js";

export const getTodayVisit = async (req, res) => {
    
    try {

        const today = new Date();

        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

        const getTodayVisits = await Visit.find({
        updatedAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate("patient");

        return res.status(200).json(getTodayVisits);

    } catch (err) {
        console.error("getTodayPatients error:", err.message);
        return res.status(500).json({ error: "Server error" , message: err.message});
    }

}

export const searchPatientByPhone = async (req, res) => {

    const { phone } = req.query
    
    try {
        if (!phone || phone.length < 4) {
            return res.status(200).json([]); // Don't search if too short
        }

        if (!/^\d+$/.test(phone)) {
            return res.status(400).json({ error: 'Phone must contain digits only' });
        }

        const matches = await Patient.find({
            phone: { $regex: `${phone}`, $options: 'i' }
        }).limit(5);

        res.status(200).json(matches);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

export const getAllVisits = async (req, res) => {
    const { 
        search, 
        page = 1, 
        pageSize = 50,
        sortField,
        sortDirection = 'desc'
    } = req.query;


    const skip = (page - 1) * pageSize;

    try {
        const pipeline = [];

        // Stage 1: Lookup patient data
        pipeline.push({
            $lookup: {
                from: 'patients',
                localField: 'patient',
                foreignField: '_id',
                as: 'patientData'
            }
        });

        // Stage 2: Unwind patient data
        pipeline.push({
            $unwind: {
                path: '$patientData',
                preserveNullAndEmptyArrays: true
            }
        });

        // Stage 3: Search filter
        if (search && search.trim()) {
            const searchTerm = search.trim();
            pipeline.push({
                $match: {
                    $or: [visitSearchQuery]
                }
            });
        }

        // Stage 4: Project (flatten) the data
        pipeline.push({
            $project: {
                id: '$_id',
                tokenNo: 1,
                registrationTime: 1,
                registrationDate: 1,
                appointmentType: 1,
                priority: 1,
                status: 1,
                medicalHistory: 1,
                createdAt: 1,
                updatedAt: 1,
                // Patient fields
                patientId: '$patientData._id',
                fullName: '$patientData.fullName',
                phone: '$patientData.phone',
                email: '$patientData.email',
                address: '$patientData.address',
                age: '$patientData.age',
                gender: '$patientData.gender',
                emergencyContact: '$patientData.emergencyContact',
                emergencyPhone: '$patientData.emergencyPhone',
            }
        });

        // Stage 5: Sort
        const sortObj = {};
        if (sortField) {
            sortObj[sortField] = sortDirection === 'asc' ? 1 : -1;
        } else {
            sortObj.createdAt = -1;
        }
        pipeline.push({ $sort: sortObj });

        // Stage 6: Facet for pagination
        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: parseInt(pageSize) }
                ]
            }
        });

        const result = await Visit.aggregate(pipeline);

        const total = result[0].metadata[0]?.total || 0;
        const data = result[0].data || [];

        res.status(200).json({
            success: true,
            data: data,
            total: total,
            currentPage: Number(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });

    } catch (error) {
        console.error('❌ Aggregation error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getAllPatient = async (req, res) => {
    const { 
        search, 
        page = 1, 
        pageSize = 10,
        sortField,
        sortDirection = 'desc'
    } = req.query;

    const skip = (page - 1) * pageSize;

    try {
        const pipeline = [];

        // Stage 1: Match (Search filter)
        if (search && search.trim()) {
            const searchTerm = search.trim();
            pipeline.push({
                $match: {
                    $or: [patientSearchQuery]
                }
            });
        }

        // Stage 2: Lookup all visits
        pipeline.push({
            $lookup: {
                from: 'patientvisits',
                localField: '_id',
                foreignField: 'patient',
                as: 'visits'
            }
        });

        // Stage 3: Get latest visit details
        pipeline.push({
            $addFields: {
                totalVisits: { $size: '$visits' },
                latestVisit: {
                    $arrayElemAt: [
                        {
                            $sortArray: {
                                input: '$visits',
                                sortBy: { registrationDate: -1 }
                            }
                        },
                        0
                    ]
                }
            }
        });

        // Stage 4: Project final structure
        pipeline.push({
            $project: {
                fullName: 1,
                phone: 1,
                email: 1,
                address: 1,
                age: 1,
                gender: 1,
                emergencyContact: 1,
                emergencyPhone: 1,
                totalVisits: 1,
                lastVisitDate: '$latestVisit.registrationDate',
                lastVisitStatus: '$latestVisit.status',
                lastVisitType: '$latestVisit.appointmentType',
                createdAt: 1,
                updatedAt: 1
            }
        });

        // Stage 5: Sort
        const sortObj = {};
        if (sortField) {
            sortObj[sortField] = sortDirection === 'asc' ? 1 : -1;
        } else {
            sortObj.createdAt = -1;
        }
        pipeline.push({ $sort: sortObj });

        // Stage 6: Facet for pagination
        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: parseInt(pageSize) }
                ]
            }
        });

        const result = await Patient.aggregate(pipeline);

        const total = result[0].metadata[0]?.total || 0;
        const data = result[0].data || [];

        console.log('✅ Result:', data, 'Total:', total);

        res.status(200).json({
            success: true,
            data: data,
            total: total,
            currentPage: Number(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
};

export const registerPatientAndVisit = async (req, res) => {
    
    const {patientData , visitData} = req.body    
    
    try {
        const patient = await Patient.create(patientData)
        const visitResponse = await Visit.create({...visitData , patient: patient._id})

        const patientWithVisit = await visitResponse.populate("patient")        
                
        res.status(201).json(patientWithVisit);        

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

export const insertNewVisit = async (req, res) => {

    const { patientId , visitData } = req.body || {};
    
    try {
        const response = await Visit.create({...visitData , patient: patientId})
        
        const newVisit = await response.populate("patient")

        console.log(newVisit);
        
        res.status(201).json(newVisit);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

export const updatePatientInfo = async (req, res) => {
    
    const { id } = req.params
    const { patientData } = req.body    
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(id, patientData , {new: true})

        res.status(201).json(updatedPatient);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

export const updateVisitDetails = async (req, res) => {
    const { id , status } = req.query
    
    console.log("status" , status , "id" , id);
    

    // try {
    //     const updatedPatient = await Patient.findByIdAndUpdate(id, patientData  , {new: true})

    //     res.status(201).json(updatedPatient);

    // } catch (error) {
    //     res.status(400).json({ error: error.message });
    // }

}

export const updateMedicalHistory = async (req, res) => {
    const id = req.params

    try {
        const patient = await Patient.findByIdAndUpdate(id, { $set: { medicalHistory: req.body } })

        res.status(201).json(patient);
        console.log(patient);


    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

export const deleteAllVisits = async (req, res) => {
    try {
        const deleteAllPatients = await Patient.deleteMany({});
        const deleteAllVisits = await Visit.deleteMany({});

        res.status(201).json({deleteAllPatients ,deleteAllVisits });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}