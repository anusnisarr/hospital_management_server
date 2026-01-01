import Patient from "../models/patient.models.js"
import { patientSearchQuery } from "../utils/buildSearchQuery.js";

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

export const updatePatientInfo = async (req, res) => {

    const { id } = req.params
    const { patientData } = req.body
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(id, patientData, { new: true })

        res.status(201).json(updatedPatient);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

};