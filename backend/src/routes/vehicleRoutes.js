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

// All routes are protected by verifyToken middleware
router.post('/', verifyToken, createVehicle); // Create a new vehicle
router.get('/', verifyToken, getVehicles); // Get all vehicles
router.get('/:id', verifyToken, getVehicleById); // Get a vehicle by ID
router.put('/:id', verifyToken, updateVehicle); // Update a vehicle by ID
router.delete('/:id', verifyToken, deleteVehicle); // Delete a vehicle by ID

module.exports = router;