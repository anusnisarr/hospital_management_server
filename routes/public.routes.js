// routes/public.routes.js
import express from 'express';
import { registerTenant, checkSlugAvailability } from '../controllers/tenant.controller.js';
import { login , logout , createUser } from "../controllers/auth.controller.js"; 

const router = express.Router();

router.post('/login' , login)
router.post('/logout' , logout)
router.post('/createUser' , createUser)
router.post('/createUser', registerTenant);
router.get('/check-slug/:slug', checkSlugAvailability);

export default router;