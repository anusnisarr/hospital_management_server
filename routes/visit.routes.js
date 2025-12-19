import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

import { getAllVisits , getTodayVisit , insertNewVisit ,  registerPatientAndVisit , updateMedicalHistory , updateVisitDetails , deleteAllVisits } from "../controllers/patient.controller.js"; 

const router = express.Router();

router.get('/', authenticateToken ,  getAllVisits)
router.get('/todayVisits' , authenticateToken, getTodayVisit)
router.post('/registerPatientAndVisit' , registerPatientAndVisit)
router.post('/newVisit' , insertNewVisit)
router.patch('/updateMedicalHistory/:_id' , updateMedicalHistory)
router.patch('/update' , updateVisitDetails)
router.delete('/Delete' , deleteAllVisits)



export default router;


