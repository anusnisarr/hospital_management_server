import express from 'express';
import { getTenantDetails, updateTenant , checkSlugAvailability } from '../controllers/tenant.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { extractTenant, validateTenantAccess  } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(extractTenant);
router.use(validateTenantAccess);

router.get('/details', getTenantDetails);
router.put('/update', updateTenant);
router.get('/tenant/validate', checkSlugAvailability);

export default router;