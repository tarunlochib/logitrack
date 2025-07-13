const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { getAnalyticsOverview, getTopTransporters, getRecentShipments, getUserGrowth, getTransporterStatusCounts, getAllShipments, getSuperadminShipmentById } = require('../controllers/superadminController');

// All routes require SUPERADMIN role
router.use(verifyToken);
router.use(authorizeRoles('SUPERADMIN'));

// Create new transporter
router.post('/create-transporter', superadminController.createTransporter);
router.post('/transporters', superadminController.createTransporter);

// Get all transporters
router.get('/transporters', superadminController.getAllTransporters);

// Get transporter details
router.get('/transporters/:id', superadminController.getTransporterDetails);

// Update transporter status
router.patch('/transporters/:id/status', superadminController.updateTransporterStatus);

// Update transporter info
router.patch('/transporters/:id', superadminController.updateTransporter);

// Delete transporter
router.delete('/transporters/:id', superadminController.deleteTransporter);

// Get dashboard statistics
router.get('/dashboard-stats', superadminController.getDashboardStats);

// Get all users (with optional filters)
router.get('/users', superadminController.getAllUsers);

router.get('/analytics/overview', verifyToken, authorizeRoles('SUPERADMIN'), getAnalyticsOverview);
router.get('/analytics/top-transporters', verifyToken, authorizeRoles('SUPERADMIN'), getTopTransporters);
router.get('/analytics/recent-shipments', verifyToken, authorizeRoles('SUPERADMIN'), getRecentShipments);
router.get('/analytics/user-growth', verifyToken, authorizeRoles('SUPERADMIN'), getUserGrowth);
router.get('/analytics/transporter-status', verifyToken, authorizeRoles('SUPERADMIN'), getTransporterStatusCounts);
router.get('/shipments', getAllShipments);
router.get('/shipments/:id', getSuperadminShipmentById);

module.exports = router; 