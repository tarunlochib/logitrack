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
const { requireTenant } = require('../middlewares/tenantMiddleware');

router.post('/', verifyToken, requireTenant, createDriver); // Create a new driver
router.get('/', verifyToken, requireTenant, getDrivers); // Get all drivers
router.get('/with-user', verifyToken, requireTenant, getDriversWithUser); // Get all drivers with user info (for assignment)
router.get('/:id', verifyToken, requireTenant, getDriverById); // Get a driver by ID
router.put('/:id', verifyToken, requireTenant, updateDriver); // Update a driver by ID
router.delete('/:id', verifyToken, requireTenant, deleteDriver); // Delete a driver by ID
router.post('/assign', verifyToken, requireTenant, assignDriverToVehicle); // Assign driver to vehicle
router.post('/:driverId/unassign', verifyToken, requireTenant, unassignDriverFromVehicle); // Unassign driver from vehicle

module.exports = router;