import Patient from "../models/patient.models.js"
import Visit from "../models/visits.modals.js";
import {buildSearchQuery} from "../utils/buildSearchQuery.js";

export const getTodayVisit = async (req, res) => {

    console.log("API req" , req.headers);
    
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

    const  {page = 1, limit= 50 , columnsName , search} = req.query   

    const filter = buildSearchQuery(search);

    const skip = (page - 1) * limit;

    const projection =  columnsName ? columnsName.split(",").join(" "): "";
    
    try {
        const res = await Visit.find(filter)
        .select(projection)
        .populate({path:"patient" , select: projection})
        .skip(skip)
        .limit(limit)
        .lean().
        sort({ createdAt: -1 });

        const flatData = res.map(v => ({
            id: v._id,
            patientId: v.patient._id,
            ...v,
            ...v.patient,
            ...v.patient,
            patient: undefined
        }));

        const total = await res.countDocuments();

        res.status(201).json({ data: flatData, total });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

export const getAllPatient = async (req, res) => {

    const  {page = 1, limit= 10 , columnsName , search} = req.query    

    const filter = buildSearchQuery(search);

    const skip = (page - 1) * limit;

    const projection =  columnsName ? columnsName.split(",").join(" "): "";
    
    try {
        const patients = await Patient.find(filter)
        .select(projection)
        .skip(skip)
        .limit(limit)
        .lean().
        sort({ createdAt: -1 });

    const flatData = patients.map(v => ({
        id: v._id,
        ...v,
    }));

        const total = await Patient.countDocuments();

        res.status(201).json({ data: flatData, total });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

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