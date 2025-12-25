import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { searchPatientByPhone , updatePatientInfo , getAllPatient } from "../controllers/patient.controller.js"; 

const router = express.Router();
router.get('/' , authenticateToken , getAllPatient)
router.get('/search' , authenticateToken , searchPatientByPhone)
router.patch('/update/:id' , authenticateToken , updatePatientInfo)

export default router;


