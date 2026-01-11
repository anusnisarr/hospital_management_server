import Patient from "../models/patient.models.js"
import Visit from "../models/visits.modals.js";
import { visitSearchQuery } from "../utils/buildSearchQuery.js";

export const getTodayVisit = async (req, res) => {
    const {
        search,
        page = 1,
        pageSize = 50,
        sortField,
        sortDirection = 'desc'
    } = req.query;

        const today = new Date();

        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
        
        const skip = (page - 1) * pageSize;

        try {
            const pipeline = [];

                pipeline.push({
                    $match: { updatedAt: { $gte: startOfDay, $lte: endOfDay }}
                })                
                
                pipeline.push({
                    $match: { updatedAt: { $gte: startOfDay, $lte: endOfDay }}
                })

                if (search && search.trim()) {
                    const searchTerm = search.trim();
                    pipeline.push({
                        $match: {
                            $or: [visitSearchQuery]
                        }
                    });
                }

                const sortObj = {};
                if (sortField) {
                    sortObj[sortField] = sortDirection === 'asc' ? 1 : -1;
                } else {
                    sortObj.createdAt = -1;
                }
                pipeline.push({ $sort: sortObj });

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

    } catch (err) {
        console.error("getTodayPatients error:", err.message);
        return res.status(500).json({ error: "Server error", message: err.message });
    }

};

export const getAllTodayVisit = async (req, res) => {
    
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

export const insertNewVisit = async (req, res) => {

    const { patientId, visitData } = req.body || {};

    try {
        const response = await Visit.create({ ...visitData, patient: patientId })

        const newVisit = await response.populate("patient")

        res.status(201).json(newVisit);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

};

export const updateVisitDetails = async (req, res) => {
    
    const { fields } = req.body;
    const { _id } = req.params;

    if (!_id) {
        return res.status(400).json({ message: "Id is required" });
    }

    try {
        const updatedVisit = await Visit.findByIdAndUpdate(
        _id,
        {...fields},
        { new: true, runValidators: true }
        );

        if (!updatedVisit) {
        return res.status(404).json({ message: "Visit not found" });
        }

        return res.status(200).json(updatedVisit);

    } catch (error) {
        console.error("Update Visit Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
    };


export const updateMedicalHistory = async (req, res) => {
    const id = req.params

    try {
        const patient = await Patient.findByIdAndUpdate(id, { $set: { medicalHistory: req.body } })

        res.status(201).json(patient);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

};

export const deleteAllVisits = async (req, res) => {
    try {
        const deleteAllPatients = await Patient.deleteMany({});
        const deleteAllVisits = await Visit.deleteMany({});

        res.status(201).json({ deleteAllPatients, deleteAllVisits });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

};

export const registerPatientAndVisit = async (req, res) => {

    const { patientData, visitData } = req.body

    try {
        const patient = await Patient.create(patientData)
        const visitResponse = await Visit.create({ ...visitData, patient: patient._id })

        const patientWithVisit = await visitResponse.populate("patient")

        res.status(201).json(patientWithVisit);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

};
