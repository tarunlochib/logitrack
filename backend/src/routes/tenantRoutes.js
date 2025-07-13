const express = require('express');
const router = express.Router();
const {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    getTenantBySlug,
    getTenantStats
} = require('../controllers/tenantController');

const { verifyToken } = require('../middlewares/authMiddleware');

// Tenant management routes (Super Admin only)
router.post('/', verifyToken, createTenant); // Create new tenant
router.get('/', verifyToken, getTenants); // Get all tenants
router.get('/:id', verifyToken, getTenantById); // Get tenant by ID
router.put('/:id', verifyToken, updateTenant); // Update tenant
router.delete('/:id', verifyToken, deleteTenant); // Delete tenant
router.get('/:id/stats', verifyToken, getTenantStats); // Get tenant statistics

// Public route for tenant lookup (for subdomain routing)
router.get('/slug/:slug', getTenantBySlug); // Get tenant by slug

module.exports = router; 