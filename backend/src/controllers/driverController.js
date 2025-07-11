const { PrismaClient } = require('@prisma/client');
const { get } = require('../routes/authRoutes');
const prisma = new PrismaClient();

// Create a new driver
const createDriver = async (req, res) => {
    const { name, phone, licenseNumber, vehicleId } = req.body;

    try {
        const driver = await prisma.driver.create({
            data: {
                name,
                phone,
                licenseNumber,
                vehicleId: vehicleId ? parseInt(vehicleId) : null, // Ensure vehicleId is stored as an integer 
            },
        });
        res.status(201).json({ message: 'Driver created successfully', driver });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all drivers
const getDrivers = async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({
            include: { 
                vehicle: true, // Include vehicle details
                Shipment: true // Include shipment details
            },
        });
        res.status(200).json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a driver by ID
const getDriverById = async (req, res) => {
    const { id } = req.params;

    try {
        const driver = await prisma.driver.findUnique({
            where: { id: parseInt(id) },
            include: { 
                vehicle: true, // Include vehicle details
                Shipment: true // Include shipment details
            },
        });

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        res.status(500).json({message: "Internal server error" });
    }

};

// Update a driver by ID
const updateDriver = async (req, res) => {
    const { id } = req.params;
    const { name, phone, licenseNumber, vehicleId } = req.body;

    try {
        const driver = await prisma.driver.update({
            where: { id: parseInt(id) },
            data: {
                name,
                phone,
                licenseNumber,
                vehicleId: vehicleId ? parseInt(vehicleId) : null, // Ensure vehicleId is stored as an integer
            },
            include: { 
                vehicle: true, // Include vehicle details
                Shipment: true // Include shipment details
            },
        });
        res.json({ message: 'Driver updated successfully', driver });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign driver to vehicle
const assignDriverToVehicle = async (req, res) => {
    const { driverId, vehicleId } = req.body;

    try {
        // First, check if the vehicle is already assigned to another driver
        const existingDriver = await prisma.driver.findFirst({
            where: { vehicleId: parseInt(vehicleId) }
        });

        if (existingDriver && existingDriver.id !== parseInt(driverId)) {
            return res.status(400).json({ 
                message: 'Vehicle is already assigned to another driver. Please unassign first.' 
            });
        }

        // Update the driver with the vehicle assignment
        const driver = await prisma.driver.update({
            where: { id: parseInt(driverId) },
            data: { vehicleId: parseInt(vehicleId) },
            include: { 
                vehicle: true,
                Shipment: true
            },
        });

        res.json({ message: 'Driver assigned to vehicle successfully', driver });
    } catch (error) {
        console.error('Error assigning driver to vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Unassign driver from vehicle
const unassignDriverFromVehicle = async (req, res) => {
    const { driverId } = req.params;

    try {
        const driver = await prisma.driver.update({
            where: { id: parseInt(driverId) },
            data: { vehicleId: null },
            include: { 
                vehicle: true,
                Shipment: true
            },
        });

        res.json({ message: 'Driver unassigned from vehicle successfully', driver });
    } catch (error) {
        console.error('Error unassigning driver from vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a driver by ID
const deleteDriver = async (req, res) => {
    const { id } = req.params;

    try {
        const driver = await prisma.driver.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Driver deleted successfully', driver });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all drivers with user info (for assignment)
const getDriversWithUser = async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({
            include: {
                user: true
            }
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createDriver, getDrivers, getDriverById, updateDriver, deleteDriver, assignDriverToVehicle, unassignDriverFromVehicle,
    getDriversWithUser
};
