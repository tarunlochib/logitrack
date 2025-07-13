const   { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new shipment
const createShipment = async (req, res) => {
    try {
        const{
            consigneeName,
            consigneeAddress,
            consignorName,
            consignorAddress,
            consigneeGstNo,
            consignorGstNo,
            date,
            billNo,
            transportName,
            goodsType,
            goodsDescription,
            weight,
            privateMark,
            paymentMethod,
            freightCharges,
            localCartageCharges,
            hamaliCharges,
            stationaryCharges,
            doorDeliveryCharges,
            otherCharges,
            grandTotal,
            source,
            destination,
            ewayBillNumber,
            driverId,
            vehicleId
        }   = req.body;

        const shipment = await prisma.shipment.create({
            data: {
                consigneeName,
                consigneeAddress,
                consignorName,
                consignorAddress,
                consigneeGstNo,
                consignorGstNo,
                date: new Date(date), // Ensure date is stored as a Date object
                billNo,
                transportName,
                goodsType,
                goodsDescription,
                weight: parseFloat(weight), // Ensure weight is stored as a float
                privateMark,
                paymentMethod,
                freightCharges: parseFloat(freightCharges),
                localCartageCharges: parseFloat(localCartageCharges),
                hamaliCharges: parseFloat(hamaliCharges),
                stationaryCharges: parseFloat(stationaryCharges),
                doorDeliveryCharges: parseFloat(doorDeliveryCharges),
                otherCharges: parseFloat(otherCharges),
                grandTotal: parseFloat(grandTotal),
                source,
                destination,
                ewayBillNumber,
                driverId: driverId ? parseInt(driverId) : null, // Ensure driverId is stored as an integer
                vehicleId: vehicleId ? parseInt(vehicleId) : null, // Ensure vehicleId is stored as an integer
                tenantId: req.tenant.id
            },
        });

        res.status(201).json({ message: 'Shipment created successfully', shipment });
    } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('billNo')) {
            return res.status(400).json({ message: 'A shipment with this Bill Number already exists. Please use a unique Bill Number.' });
        }
        
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

};


// Get all shipments
const getShipments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * pageSize;

        // Advanced filters
        const {
            status,
            paymentMethod,
            fromDate,
            toDate,
            driverId,
            vehicleId,
            source,
            destination
        } = req.query;

        // Build search filter
        const searchFilter = search
            ? {
                OR: [
                    { consigneeName: { contains: search, mode: 'insensitive' } },
                    { consignorName: { contains: search, mode: 'insensitive' } },
                    { billNo: { contains: search, mode: 'insensitive' } },
                    { transportName: { contains: search, mode: 'insensitive' } },
                ]
            }
            : {};

        // Build advanced filters
        let advancedFilters = {};
        if (status && status !== "") advancedFilters.status = status;
        if (paymentMethod && paymentMethod !== "") advancedFilters.paymentMethod = paymentMethod;
        if (fromDate && toDate) {
            advancedFilters.date = {
                gte: new Date(fromDate),
                lte: new Date(new Date(toDate).setHours(23, 59, 59, 999))
            };
        }
        if (driverId) advancedFilters.driverId = parseInt(driverId);
        if (vehicleId) advancedFilters.vehicleId = parseInt(vehicleId);
        if (source) {
            advancedFilters.source = { contains: source, mode: 'insensitive' };
        }
        if (destination) {
            advancedFilters.destination = { contains: destination, mode: 'insensitive' };
        }

        let where = { ...searchFilter, ...advancedFilters, tenantId: req.tenant.id };
        if (req.user.role === 'DRIVER') {
            // Find the driver's record for this user
            const driver = await prisma.driver.findUnique({
                where: { userId: req.user.id }
            });
            if (!driver) {
                return res.status(200).json({ shipments: [], total: 0, page, pageSize });
            }
            where = { ...where, driverId: driver.id };
        }

        const [shipments, total] = await Promise.all([
            prisma.shipment.findMany({
                where,
                include: { driver: true, vehicle: true },
                skip,
                take: pageSize,
                orderBy: { date: 'desc' },
            }),
            prisma.shipment.count({ where })
        ]);

        res.status(200).json({ shipments, total, page, pageSize });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a shipment by ID
const getShipmentById = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if tenant is available
        if (!req.tenant || !req.tenant.id) {
            return res.status(400).json({ message: 'Tenant identification required' });
        }

        const shipment = await prisma.shipment.findFirst({
            where: { id: parseInt(id), tenantId: req.tenant.id },
            include: {
                driver: true, // Include driver details
                vehicle: true, // Include vehicle details
            },
        });

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json(shipment);
    } catch (error) {
        console.error('Error fetching shipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a shipment by ID
const updateShipment = async (req, res) => {
    const { id } = req.params;
    const {
        consigneeName,
        consigneeAddress,
        consignorName,
        consignorAddress,
        consigneeGstNo,
        consignorGstNo,
        date,
        billNo,
        transportName,
        goodsType,
        goodsDescription,
        weight,
        privateMark,
        paymentMethod,
        freightCharges,
        localCartageCharges,
        hamaliCharges,
        stationaryCharges,
        doorDeliveryCharges,
        otherCharges,
        grandTotal,
        source,
        destination,
        ewayBillNumber,
        driverId,
        vehicleId
    } = req.body;

    try {
        // Check if tenant is available
        if (!req.tenant || !req.tenant.id) {
            return res.status(400).json({ message: 'Tenant identification required' });
        }

        // Ensure the shipment belongs to the tenant
        const existing = await prisma.shipment.findFirst({ where: { id: parseInt(id), tenantId: req.tenant.id } });
        if (!existing) {
            return res.status(404).json({ message: 'Shipment not found for this tenant' });
        }
        const shipment = await prisma.shipment.update({
            where: { id: parseInt(id) },
            data: {
                consigneeName,
                consigneeAddress,
                consignorName,
                consignorAddress,
                consigneeGstNo,
                consignorGstNo,
                date: new Date(date), // Ensure date is stored as a Date object
                billNo,
                transportName,
                goodsType,
                goodsDescription,
                weight: parseFloat(weight), // Ensure weight is stored as a float
                privateMark,
                paymentMethod,
                freightCharges: parseFloat(freightCharges),
                localCartageCharges: parseFloat(localCartageCharges),
                hamaliCharges: parseFloat(hamaliCharges),
                stationaryCharges: parseFloat(stationaryCharges),
                doorDeliveryCharges: parseFloat(doorDeliveryCharges),
                otherCharges: parseFloat(otherCharges),
                grandTotal: parseFloat(grandTotal),
                source,
                destination,
                ewayBillNumber,
                driverId: driverId ? parseInt(driverId) : null, // Ensure driverId is stored as an integer
                vehicleId: vehicleId ? parseInt(vehicleId) : null, // Ensure vehicleId is stored as an integer
            },
            include: {
                driver: true, // Include driver details
                vehicle: true, // Include vehicle details
            },
        });

        res.json({ message: 'Shipment updated successfully', shipment });
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a shipment by ID
const deleteShipment = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if tenant is available
        if (!req.tenant || !req.tenant.id) {
            return res.status(400).json({ message: 'Tenant identification required' });
        }

        // Ensure the shipment belongs to the tenant
        const shipment = await prisma.shipment.findFirst({ where: { id: parseInt(id), tenantId: req.tenant.id } });
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found for this tenant' });
        }
        const deleted = await prisma.shipment.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Shipment deleted successfully', shipment: deleted });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//search shipments logic
const searchShipments = async (req, res) => {
    try {
        // Check if tenant is available
        if (!req.tenant || !req.tenant.id) {
            return res.status(400).json({ message: 'Tenant identification required' });
        }

        const {
            fromDate,
            toDate,
            paymentMethod,
            source,
            destination,
            billNo,
            goodsType,
            transportName
        }   = req.query;

        const   filters = { tenantId: req.tenant.id };

        if (fromDate && toDate) {
            filters.date = {
                gte: new Date(fromDate),
                lte: new Date(toDate)
            };
        }

        if (paymentMethod) {
            filters.paymentMethod = paymentMethod;
        }

        if (source) {
            filters.source = {
                contains: source,
                mode: 'insensitive' // Case-insensitive search
            };
        }   

        if (destination) {
            filters.destination = {
                contains: destination,
                mode: 'insensitive' // Case-insensitive search
            };
        }

        if (billNo) {
            filters.billNo = {
                contains: billNo,
                mode: 'insensitive' // Case-insensitive search
            };
        }

        if (goodsType) {
            filters.goodsType = {
                contains: goodsType,
                mode: 'insensitive' // Case-insensitive search
            };
        }

        if (transportName) {
            filters.transportName = {
                contains: transportName,
                mode: 'insensitive' // Case-insensitive search
            };
        }

        const results = await prisma.shipment.findMany({
            where: filters,
            include: {
                driver: true, // Include driver details
                vehicle: true, // Include vehicle details
            },
        });

        res.json(results);
    } catch (error) {
        console.error('Error searching shipments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark shipment as completed
const markShipmentCompleted = async (req, res) => {
    const { id } = req.params;
    try {
        // Only allow if user is DRIVER and assigned to this shipment, or ADMIN/SUPERADMIN
        const shipment = await prisma.shipment.findUnique({ where: { id: parseInt(id) } });
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        if (
            req.user.role === 'DRIVER' && shipment.driverId !== undefined && shipment.driverId !== null
        ) {
            // Find the driver's record for this user
            const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
            if (!driver || shipment.driverId !== driver.id) {
                return res.status(403).json({ message: 'You are not assigned to this shipment.' });
            }
        } else if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        const updated = await prisma.shipment.update({
            where: { id: parseInt(id) },
            data: { status: 'COMPLETED' },
        });
        res.json({ message: 'Shipment marked as completed', shipment: updated });
    } catch (error) {
        console.error('Error marking shipment as completed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update shipment status (for admin roles)
const updateShipmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        if (!['SUPERADMIN', 'ADMIN', 'DISPATCHER'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        const updated = await prisma.shipment.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        res.json({ message: 'Shipment status updated', shipment: updated });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    searchShipments,
    markShipmentCompleted,
    updateShipmentStatus
};