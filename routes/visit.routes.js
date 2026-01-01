import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

import { getAllVisits, getTodayVisit, insertNewVisit, registerPatientAndVisit, updateMedicalHistory, updateVisitDetails, deleteAllVisits } from "../controllers/visit.controller.js"; 

const router = express.Router();

router.get('/', authenticateToken ,  getAllVisits)
router.get('/todayVisits' , authenticateToken, getTodayVisit)
router.post('/registerPatientAndVisit' , authenticateToken , registerPatientAndVisit)
router.post('/newVisit' , authenticateToken , insertNewVisit)
router.patch('/updateMedicalHistory/:_id' ,authenticateToken, updateMedicalHistory)
router.patch('/update' , authenticateToken , updateVisitDetails)
router.delete('/Delete' ,authenticateToken , deleteAllVisits)





export default router;


