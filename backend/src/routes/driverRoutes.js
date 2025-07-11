const express = require('express');
const router = express.Router();
const {
    createDriver,
    getDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    assignDriverToVehicle,
    unassignDriverFromVehicle,
    getDriversWithUser
}      = require('../controllers/driverController');

const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createDriver); // Create a new driver
router.get('/', verifyToken, getDrivers); // Get all drivers
router.get('/with-user', verifyToken, getDriversWithUser); // Get all drivers with user info (for assignment)
router.get('/:id', verifyToken, getDriverById); // Get a driver by ID
router.put('/:id', verifyToken, updateDriver); // Update a driver by ID
router.delete('/:id', verifyToken, deleteDriver); // Delete a driver by ID
router.post('/assign', verifyToken, assignDriverToVehicle); // Assign driver to vehicle
router.post('/:driverId/unassign', verifyToken, unassignDriverFromVehicle); // Unassign driver from vehicle

module.exports = router;