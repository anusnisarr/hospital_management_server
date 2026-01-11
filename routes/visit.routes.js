import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

import { getAllVisits, getTodayVisit, getAllTodayVisit, insertNewVisit, registerPatientAndVisit, updateMedicalHistory, updateVisitDetails, deleteAllVisits } from "../controllers/visit.controller.js"; 

const router = express.Router();

router.get('/', authenticateToken ,  getAllVisits)
router.get('/todayVisits' , authenticateToken, getTodayVisit)
router.get('/AllTodayVisits' , authenticateToken, getAllTodayVisit)
router.post('/registerPatientAndVisit' , authenticateToken , registerPatientAndVisit)
router.post('/newVisit' , authenticateToken , insertNewVisit)
router.patch('/updateMedicalHistory/:_id' ,authenticateToken, updateMedicalHistory)
router.patch('/updateVisitDetails/:_id' , authenticateToken , updateVisitDetails)
router.delete('/Delete' , authenticateToken , deleteAllVisits)





export default router;


