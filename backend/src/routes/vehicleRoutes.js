const express = require('express');
const router = express.Router();
const {
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');

const { verifyToken } = require('../middlewares/authMiddleware');
const { requireTenant } = require('../middlewares/tenantMiddleware');

// All routes are protected by verifyToken middleware and require tenant identification
router.post('/', verifyToken, requireTenant, createVehicle); // Create a new vehicle
router.get('/', verifyToken, requireTenant, getVehicles); // Get all vehicles
router.get('/:id', verifyToken, requireTenant, getVehicleById); // Get a vehicle by ID
router.put('/:id', verifyToken, requireTenant, updateVehicle); // Update a vehicle by ID
router.delete('/:id', verifyToken, requireTenant, deleteVehicle); // Delete a vehicle by ID

module.exports = router;