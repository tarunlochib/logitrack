const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { get } = require('../routes/authRoutes');
const prisma = new PrismaClient();

// Create a new driver
const createDriver = async (req, res) => {
    const { name, phone, licenseNumber, vehicleId, email, password, tenantId } = req.body;

    try {
        // Generate a memorable temporary password if not provided
        const generateMemorablePassword = () => {
            const adjectives = ['happy', 'quick', 'smart', 'brave', 'calm', 'wise', 'kind', 'bold'];
            const nouns = ['driver', 'truck', 'road', 'journey', 'travel', 'route', 'path', 'way'];
            const numbers = Math.floor(Math.random() * 900) + 100; // 3-digit number
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            return `${adj}${noun}${numbers}`;
        };
        
        const tempPassword = password || generateMemorablePassword();
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // First, create a user account for the driver
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: 'DRIVER',
                tenantId: tenantId || req.tenant?.id
            }
        });

        // Then create the driver linked to the user
        const driver = await prisma.driver.create({
            data: {
                userId: user.id,
                name,
                phone,
                licenseNumber,
                vehicleId: vehicleId ? parseInt(vehicleId) : null,
                tenantId: tenantId || req.tenant?.id
            },
            include: {
                user: true,
                vehicle: true
            }
        });
        
        res.status(201).json({ 
            message: 'Driver created successfully', 
            driver,
            tempPassword: tempPassword // Return the temporary password
        });
    } catch (error) {
        console.error('Error creating driver:', error);
        console.error('Error code:', error.code);
        console.error('Error meta:', error.meta);
        
        // Handle specific errors
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('email')) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            if (error.meta?.target?.includes('phone')) {
                return res.status(400).json({ message: 'Phone number already exists' });
            }
            if (error.meta?.target?.includes('licenseNumber')) {
                return res.status(400).json({ message: 'License number already exists' });
            }
            // If we can't identify the specific field, return a generic message
            return res.status(400).json({ message: 'A record with this information already exists' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all drivers
const getDrivers = async (req, res) => {
    try {
        const whereClause = req.tenant ? { tenantId: req.tenant.id } : {};
        
        const drivers = await prisma.driver.findMany({
            where: whereClause,
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
        const driver = await prisma.driver.findFirst({
            where: { id: parseInt(id), tenantId: req.tenant.id },
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
        // Ensure the driver belongs to the tenant
        const existing = await prisma.driver.findFirst({ where: { id: parseInt(id), tenantId: req.tenant.id } });
        if (!existing) {
            return res.status(404).json({ message: 'Driver not found for this tenant' });
        }
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
        // Ensure the driver belongs to the tenant
        const driver = await prisma.driver.findFirst({ where: { id: parseInt(driverId), tenantId: req.tenant.id } });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found for this tenant' });
        }
        // First, check if the vehicle is already assigned to another driver in this tenant
        const existingDriver = await prisma.driver.findFirst({
            where: { vehicleId: parseInt(vehicleId), tenantId: req.tenant.id }
        });

        if (existingDriver && existingDriver.id !== parseInt(driverId)) {
            return res.status(400).json({ 
                message: 'Vehicle is already assigned to another driver. Please unassign first.' 
            });
        }

        // Update the driver with the vehicle assignment
        const updatedDriver = await prisma.driver.update({
            where: { id: parseInt(driverId) },
            data: { vehicleId: parseInt(vehicleId) },
            include: { 
                vehicle: true,
                Shipment: true
            },
        });

        res.json({ message: 'Driver assigned to vehicle successfully', driver: updatedDriver });
    } catch (error) {
        console.error('Error assigning driver to vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Unassign driver from vehicle
const unassignDriverFromVehicle = async (req, res) => {
    const { driverId } = req.params;

    try {
        // Ensure the driver belongs to the tenant
        const driver = await prisma.driver.findFirst({ where: { id: parseInt(driverId), tenantId: req.tenant.id } });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found for this tenant' });
        }
        const updatedDriver = await prisma.driver.update({
            where: { id: parseInt(driverId) },
            data: { vehicleId: null },
            include: { 
                vehicle: true,
                Shipment: true
            },
        });

        res.json({ message: 'Driver unassigned from vehicle successfully', driver: updatedDriver });
    } catch (error) {
        console.error('Error unassigning driver from vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a driver by ID
const deleteDriver = async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure the driver belongs to the tenant
        const driver = await prisma.driver.findFirst({ 
            where: { id: parseInt(id), tenantId: req.tenant.id },
            include: { user: true }
        });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found for this tenant' });
        }

        // Use a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // Delete the driver first
            const deletedDriver = await tx.driver.delete({
                where: { id: parseInt(id) },
            });

            // Then delete the associated user
            if (driver.userId) {
                await tx.user.delete({
                    where: { id: driver.userId }
                });
            }

            return deletedDriver;
        });

        res.json({ message: 'Driver and associated user account deleted successfully', driver: result });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all drivers with user info (for assignment)
const getDriversWithUser = async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({
            where: { tenantId: req.tenant.id },
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
