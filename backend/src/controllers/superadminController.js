const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new transporter (tenant) with an admin user
const createTransporter = async (req, res) => {
    const { 
        transporterName, 
        adminName, 
        adminEmail, 
        adminPassword, 
        gstNumber, 
        phone, 
        address,
        domain 
    } = req.body;

    try {
        // Validate required fields
        if (!transporterName || !adminName || !adminEmail || !adminPassword) {
            return res.status(400).json({ 
                message: 'Transporter name, admin name, email, and password are required' 
            });
        }

        // Check if transporter name already exists
        const existingTenant = await prisma.tenant.findFirst({
            where: { name: transporterName }
        });

        if (existingTenant) {
            return res.status(400).json({ 
                message: 'A transporter with this name already exists' 
            });
        }

        // Check if admin email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'A user with this email already exists' 
            });
        }

        // Generate unique slug and schema name
        const slug = transporterName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const schemaName = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create tenant
        const tenant = await prisma.tenant.create({
            data: {
                name: transporterName,
                slug: slug,
                domain: domain || null,
                schemaName: schemaName,
                isActive: true,
                gstNumber: gstNumber || null,
                settings: {
                    phone: phone || null,
                    address: address || null
                }
            }
        });

        // Hash admin password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user for the tenant
        const adminUser = await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                phone: phone || null,
                tenantId: tenant.id,
                settings: {
                    emailNotifications: true,
                    pushNotifications: false,
                    twoFactorAuth: false,
                    sessionTimeout: 30,
                    language: 'en',
                    theme: 'light'
                }
            }
        });

        res.status(201).json({
            message: 'Transporter created successfully',
            transporter: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain,
                isActive: tenant.isActive,
                gstNumber: tenant.gstNumber,
                createdAt: tenant.createdAt
            },
            admin: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            }
        });

    } catch (error) {
        console.error('Error creating transporter:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all transporters (tenants)
const getAllTransporters = async (req, res) => {
    try {
        const { search, status } = req.query;
        let where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }
        const transporters = await prisma.tenant.findMany({
            where,
            include: {
                _count: {
                    select: {
                        users: true,
                        vehicles: true,
                        drivers: true,
                        shipments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(transporters);
    } catch (error) {
        console.error('Error fetching transporters:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get transporter details
const getTransporterDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const transporter = await prisma.tenant.findUnique({
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
                vehicles: {
                    select: {
                        id: true,
                        number: true,
                        model: true,
                        isAvailable: true
                    }
                },
                drivers: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        licenseNumber: true
                    }
                },
                shipments: {
                    select: {
                        id: true,
                        billNo: true,
                        status: true,
                        createdAt: true
                    }
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

        if (!transporter) {
            return res.status(404).json({ message: 'Transporter not found' });
        }

        res.json(transporter);
    } catch (error) {
        console.error('Error fetching transporter details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update transporter status (activate/deactivate)
const updateTransporterStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
        const transporter = await prisma.tenant.update({
            where: { id: parseInt(id) },
            data: { isActive }
        });

        res.json({
            message: `Transporter ${isActive ? 'activated' : 'deactivated'} successfully`,
            transporter
        });
    } catch (error) {
        console.error('Error updating transporter status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update transporter info (name, domain, isActive)
const updateTransporter = async (req, res) => {
    const { id } = req.params;
    const { name, domain, isActive, gstNumber } = req.body;
    try {
        const updated = await prisma.tenant.update({
            where: { id: parseInt(id) },
            data: {
                name,
                domain,
                isActive,
                gstNumber
            }
        });
        res.json({ message: 'Transporter updated successfully', transporter: updated });
    } catch (error) {
        console.error('Error updating transporter:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete transporter
const deleteTransporter = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.tenant.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Transporter deleted successfully' });
    } catch (error) {
        console.error('Error deleting transporter:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get superadmin dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalTransporters,
            activeTransporters,
            totalUsers,
            totalVehicles,
            totalDrivers,
            totalShipments
        ] = await Promise.all([
            prisma.tenant.count(),
            prisma.tenant.count({ where: { isActive: true } }),
            prisma.user.count(),
            prisma.vehicle.count(),
            prisma.driver.count(),
            prisma.shipment.count()
        ]);

        res.json({
            totalTransporters,
            activeTransporters,
            inactiveTransporters: totalTransporters - activeTransporters,
            totalUsers,
            totalVehicles,
            totalDrivers,
            totalShipments
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all users (with tenant info, filter by tenant or role)
const getAllUsers = async (req, res) => {
    const { tenantId, role, search } = req.query;
    try {
        const users = await prisma.user.findMany({
            where: {
                ...(tenantId ? { tenantId: parseInt(tenantId) } : {}),
                ...(role ? { role } : {}),
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                    : {})
            },
            include: {
                tenant: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper to build date and transporter filters
function buildFilters(query) {
  const { fromDate, toDate, transporterId } = query;
  let filters = {};
  if (fromDate && toDate) {
    filters.date = { gte: new Date(fromDate), lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)) };
  }
  if (transporterId) {
    filters.tenantId = parseInt(transporterId);
  }
  return filters;
}

// Superadmin analytics overview
const getAnalyticsOverview = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    // Total shipments
    const totalShipments = await prisma.shipment.count({ where: filters });
    // Total revenue (sum of grandTotal)
    const totalRevenueResult = await prisma.shipment.aggregate({ _sum: { grandTotal: true }, where: filters });
    const totalRevenue = totalRevenueResult._sum.grandTotal || 0;
    // Active transporters
    const activeTransporters = await prisma.tenant.count({ where: { isActive: true } });
    // Active users
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    // Monthly shipments and revenue (last 12 months)
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }).reverse();
    const monthlyStats = await Promise.all(months.map(async ({ year, month }) => {
      const first = new Date(year, month - 1, 1);
      const last = new Date(year, month, 0, 23, 59, 59, 999);
      const monthFilters = { ...filters, date: { gte: first, lte: last } };
      const shipments = await prisma.shipment.count({ where: monthFilters });
      const revenueResult = await prisma.shipment.aggregate({ _sum: { grandTotal: true }, where: monthFilters });
      return {
        year,
        month,
        shipments,
        revenue: revenueResult._sum.grandTotal || 0
      };
    }));
    res.json({
      totalShipments,
      totalRevenue,
      activeTransporters,
      activeUsers,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Top transporters by shipments and revenue
const getTopTransporters = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    // Top by shipments
    const byShipments = await prisma.tenant.findMany({
      take: 5,
      orderBy: { shipments: { _count: 'desc' } },
      include: {
        _count: { select: { shipments: true } },
        shipments: { where: filters, select: { grandTotal: true } }
      }
    });
    // Top by revenue
    const byRevenue = await prisma.tenant.findMany({
      take: 5,
      include: {
        shipments: { where: filters, select: { grandTotal: true } }
      }
    });
    const byRevenueSorted = byRevenue
      .map(t => ({
        id: t.id,
        name: t.name,
        revenue: t.shipments.reduce((sum, s) => sum + (s.grandTotal || 0), 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    res.json({
      byShipments: byShipments.map(t => ({ id: t.id, name: t.name, count: t._count.shipments })),
      byRevenue: byRevenueSorted
    });
  } catch (error) {
    console.error('Error fetching top transporters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Recent shipments
const getRecentShipments = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const shipments = await prisma.shipment.findMany({
      where: filters,
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        tenant: { select: { id: true, name: true } }
      }
    });
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching recent shipments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User growth by month (last 12 months)
const getUserGrowth = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }).reverse();
    const data = await Promise.all(months.map(async ({ year, month }) => {
      const first = new Date(year, month - 1, 1);
      const last = new Date(year, month, 0, 23, 59, 59, 999);
      const monthFilters = { ...filters, createdAt: { gte: first, lte: last } };
      const count = await prisma.user.count({ where: monthFilters });
      return { year, month, count };
    }));
    res.json(data);
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Active vs inactive transporters
const getTransporterStatusCounts = async (req, res) => {
  try {
    // Filtering by date or transporterId doesn't make sense for status counts, so just return global counts
    const active = await prisma.tenant.count({ where: { isActive: true } });
    const inactive = await prisma.tenant.count({ where: { isActive: false } });
    res.json({ active, inactive });
  } catch (error) {
    console.error('Error fetching transporter status counts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all shipments (with filters for superadmin)
const getAllShipments = async (req, res) => {
  try {
    const { search, status, transporterId, fromDate, toDate, paymentMethod } = req.query;
    let where = {};

    if (search) {
      where.OR = [
        { id: isNaN(Number(search)) ? undefined : Number(search) },
        { source: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { billNo: { contains: search, mode: 'insensitive' } }
      ].filter(Boolean);
    }
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (transporterId) where.tenantId = parseInt(transporterId);
    if (fromDate && toDate) {
      where.date = {
        gte: new Date(fromDate),
        lte: new Date(new Date(toDate).setHours(23, 59, 59, 999))
      };
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single shipment by ID (for superadmin)
const getSuperadminShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        tenant: { select: { id: true, name: true } }
      }
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

// Get global settings
const getGlobalSettings = async (req, res) => {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: 1 }
        });
        if (!settings) {
            return res.status(404).json({ message: 'Global settings not found' });
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching global settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createTransporter,
    getAllTransporters,
    getTransporterDetails,
    updateTransporterStatus,
    getDashboardStats,
    updateTransporter,
    deleteTransporter,
    getAllUsers,
    getAnalyticsOverview,
    getTopTransporters,
    getRecentShipments,
    getUserGrowth,
    getTransporterStatusCounts,
    getAllShipments,
    getSuperadminShipmentById,
    getGlobalSettings,
}; 