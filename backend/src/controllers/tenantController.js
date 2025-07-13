const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new tenant (transporter)
const createTenant = async (req, res) => {
    const { name, slug, domain, settings } = req.body;

    try {
        // Generate schema name based on slug
        const schemaName = `tenant_${slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const tenant = await prisma.tenant.create({
            data: {
                name,
                slug,
                domain,
                schemaName,
                settings: settings || {}
            }
        });

        res.status(201).json({ 
            message: 'Tenant created successfully', 
            tenant 
        });
    } catch (error) {
        console.error('Error creating tenant:', error);
        
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('slug')) {
                return res.status(400).json({ message: 'Tenant slug already exists' });
            }
            if (error.meta?.target?.includes('domain')) {
                return res.status(400).json({ message: 'Domain already exists' });
            }
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all tenants
const getTenants = async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        vehicles: true,
                        drivers: true,
                        shipments: true
                    }
                }
            }
        });
        res.status(200).json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get tenant by ID
const getTenantById = async (req, res) => {
    const { id } = req.params;

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: parseInt(id) },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                },
                vehicles: true,
                drivers: true,
                shipments: {
                    take: 10, // Limit to recent shipments
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        users: true,
                        vehicles: true,
                        drivers: true,
                        shipments: true
                    }
                }
            }
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update tenant
const updateTenant = async (req, res) => {
    const { id } = req.params;
    const { name, slug, domain, isActive, settings } = req.body;

    try {
        const tenant = await prisma.tenant.update({
            where: { id: parseInt(id) },
            data: {
                name,
                slug,
                domain,
                isActive,
                settings
            }
        });
        res.json({ message: 'Tenant updated successfully', tenant });
    } catch (error) {
        console.error('Error updating tenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete tenant
const deleteTenant = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if tenant has any data
        const tenantData = await prisma.tenant.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        users: true,
                        vehicles: true,
                        drivers: true,
                        shipments: true
                    }
                }
            }
        });

        if (tenantData._count.users > 0 || 
            tenantData._count.vehicles > 0 || 
            tenantData._count.drivers > 0 || 
            tenantData._count.shipments > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete tenant with existing data. Please delete all data first.' 
            });
        }

        const tenant = await prisma.tenant.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Tenant deleted successfully', tenant });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get tenant by slug (for subdomain routing)
const getTenantBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        users: true,
                        vehicles: true,
                        drivers: true,
                        shipments: true
                    }
                }
            }
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant by slug:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get tenant statistics
const getTenantStats = async (req, res) => {
    const { id } = req.params;

    try {
        const stats = await prisma.tenant.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        users: true,
                        vehicles: true,
                        drivers: true,
                        shipments: true
                    }
                },
                shipments: {
                    select: {
                        status: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!stats) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Calculate additional statistics
        const totalShipments = stats._count.shipments;
        const completedShipments = stats.shipments.filter(s => s.status === 'COMPLETED').length;
        const pendingShipments = stats.shipments.filter(s => s.status === 'PENDING').length;
        const inProgressShipments = stats.shipments.filter(s => s.status === 'IN_PROGRESS').length;

        const statistics = {
            totalUsers: stats._count.users,
            totalVehicles: stats._count.vehicles,
            totalDrivers: stats._count.drivers,
            totalShipments,
            completedShipments,
            pendingShipments,
            inProgressShipments,
            completionRate: totalShipments > 0 ? (completedShipments / totalShipments * 100).toFixed(2) : 0
        };

        res.json(statistics);
    } catch (error) {
        console.error('Error fetching tenant statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    getTenantBySlug,
    getTenantStats
}; 