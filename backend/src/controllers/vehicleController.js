const { PrismaClient } = require('@prisma/client');
const { get } = require('../routes/authRoutes');
const prisma = new PrismaClient();

// Create a new vehicle
const createVehicle = async (req, res) => {
    const { number, model, capacity } = req.body;

    try { 
        const vehicle = await prisma.vehicle.create({
            data: {
                number,
                model,
                capacity: parseInt(capacity), // Ensure capacity is stored as an integer
                tenantId: req.tenant.id
            },
        });
        res.status(201).json({ message: 'Vehicle created successfully', vehicle });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all vehicles
const getVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { tenantId: req.tenant.id },
            include: { 
                driver: true, // Include driver details
                Shipment: true // Include shipment details
            },
        });
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a vehicle by ID
const getVehicleById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(id) },
            include: { 
                driver: true, // Include driver details
                Shipment: true // Include shipment details
            },
        });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json(vehicle);
    } catch (error) {   
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a vehicle by ID
const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { number, model, capacity, isAvailable } = req.body;

    try {
        const vehicle = await prisma.vehicle.update({
            where: { id: parseInt(id) },
            data: {
                number,
                model,
                capacity: parseInt(capacity), // Ensure capacity is stored as an integer
                isAvailable,
            },
            include: { 
                driver: true, // Include driver details
                Shipment: true // Include shipment details
            },
        });

        res.json({ message: 'Vehicle updated successfully', vehicle });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};  

// Delete a vehicle by ID
const deleteVehicle = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicle = await prisma.vehicle.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Vehicle deleted successfully', vehicle });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export the controller functions
module.exports = {
    createVehicle,  getVehicles, getVehicleById, updateVehicle, deleteVehicle, 
};