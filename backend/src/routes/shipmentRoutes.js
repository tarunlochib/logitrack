const express = require('express');
const router = express.Router();

const {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    searchShipments,
    markShipmentCompleted,
    updateShipmentStatus
} = require('../controllers/shipmentController');
const { getOverview } = require('../controllers/analyticsController');

const { verifyToken } = require('../middlewares/authMiddleware');
const { requireTenant } = require('../middlewares/tenantMiddleware');

const { generateShipmentPDF } = require('../utils/pdfGenerator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', verifyToken, requireTenant, createShipment); // Create a new shipment
router.get('/', verifyToken, requireTenant, getShipments); // Get all shipments
router.get('/', verifyToken, requireTenant, getShipments); // Get all shipments
router.get('/:id', verifyToken, requireTenant, getShipmentById); // Get a shipment by ID
router.put('/:id', verifyToken, requireTenant, updateShipment); // Update a shipment by ID
router.delete('/:id', verifyToken, requireTenant, deleteShipment); // Delete a shipment by ID
router.get('/search/advanced', verifyToken, requireTenant, searchShipments); // Search shipments by consignee or consignor name
router.patch('/:id/complete', verifyToken, requireTenant, markShipmentCompleted); // Mark shipment as completed
router.patch('/:id/status', verifyToken, requireTenant, updateShipmentStatus); // Update shipment status (for admin roles)
router.get('/analytics/overview', verifyToken, requireTenant, getOverview);

router.get('/:id/pdf', verifyToken, requireTenant, async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch shipment directly from Prisma
        const shipment = await prisma.shipment.findUnique({
            where: { id: parseInt(id) },
            include: {
                driver: true,
                vehicle: true,
            },
        });
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        // Use the generateShipmentPDF function as designed (pipes to res)
        generateShipmentPDF(shipment, res);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;