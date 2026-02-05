// middleware/tenantMiddleware.js
import Tenant from '../models/tenant.models.js';
import { navigateToRegister } from '../../frontend/src/navigation/NavigationService.js';

export const extractTenant = async (req, res, next) => {
  try {

    let tenantSlug = null;

    // Method 1: From URL path (/tenant-slug/patients)
    const pathParts = req.path.split('/').filter(Boolean);

    if (pathParts.length > 0) {
      // Check if first part is a valid slug
      const potentialSlug = pathParts[0];
      if (potentialSlug && potentialSlug.length > 0) {
        // Verify it's a tenant slug, not a route name
        const tenant = await Tenant.findOne({ slug: potentialSlug });
        if (tenant) {
          tenantSlug = potentialSlug;
        }
      }
    }

    // Method 2: From header (useful for APIs)
    if (!tenantSlug && req.headers['x-tenant-slug']) {
      tenantSlug = req.headers['x-tenant-slug'];
    }

    if (!tenantSlug) {
      navigateToRegister();
      return res.status(400).json({
        success: false,
        message: 'Tenant not specified'
      });
    }

    // Fetch tenant
    const tenant = await Tenant.findOne({ 
      slug: tenantSlug,
      status: 'active'
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found or inactive'
      });
    }

    // Attach to request
    req.tenant = tenant;
    req.tenantId = tenant._id;

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing tenant'
    });
  }
};

export const validateTenantAccess = (req, res, next) => {
  
  if (!req.user || !req.tenant) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user's tenant matches the request tenant
  if (req.user.tenant.toString() !== req.tenant._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this tenant'
    });
  }

  next();
};