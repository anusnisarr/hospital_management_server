import express from 'express';

import { searchPatientByPhone , updatePatientInfo , getAllPatient } from "../controllers/patient.controller.js"; 

const router = express.Router();
router.get('/' , getAllPatient)
router.get('/search' , searchPatientByPhone)
router.patch('/update/:id' , updatePatientInfo)

export default router;


