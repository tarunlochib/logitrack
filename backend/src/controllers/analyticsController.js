const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse date or return null
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
}

// GET /api/analytics/overview
const getOverview = async (req, res) => {
  try {
    // Parse date range from query
    const fromDate = parseDate(req.query.fromDate);
    const toDate = parseDate(req.query.toDate);
    // For SQL, fallback to last 12 months if not provided
    const trendFrom = fromDate ? fromDate : new Date(new Date().setMonth(new Date().getMonth() - 12));
    const trendTo = toDate ? toDate : new Date();

    // Build where clause for Prisma
    const where = {};
    if (fromDate) where.date = { ...(where.date || {}), gte: fromDate };
    if (toDate) where.date = { ...(where.date || {}), lte: toDate };

    // Total shipments
    const totalShipments = await prisma.shipment.count({ where });

    // Shipments by status
    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ['status'],
      _count: { status: true },
      where,
    });

    // Shipments by payment method
    const shipmentsByPaymentMethod = await prisma.shipment.groupBy({
      by: ['paymentMethod'],
      _count: { paymentMethod: true },
      where,
    });

    // Total revenue
    const totalRevenueResult = await prisma.shipment.aggregate({
      _sum: { grandTotal: true },
      where,
    });
    const totalRevenue = totalRevenueResult._sum.grandTotal || 0;

    // Revenue by month (filtered)
    const revenueByMonth = await prisma.$queryRaw`
      SELECT to_char(date, 'YYYY-MM') as month, SUM("grandTotal") as revenue
      FROM "Shipment"
      WHERE date >= ${trendFrom} AND date <= ${trendTo}
      GROUP BY month
      ORDER BY month ASC;
    `;

    // Shipments per month (filtered)
    const shipmentsPerMonth = await prisma.$queryRaw`
      SELECT to_char(date, 'YYYY-MM') as month, COUNT(*) as count
      FROM "Shipment"
      WHERE date >= ${trendFrom} AND date <= ${trendTo}
      GROUP BY month
      ORDER BY month ASC;
    `;

    // Top 5 drivers by shipment count (filtered)
    let driverWhere = '';
    let driverParams = [];
    if (fromDate && toDate) {
      driverWhere = 'WHERE s.date >= $1 AND s.date <= $2';
      driverParams = [trendFrom, trendTo];
    } else if (fromDate) {
      driverWhere = 'WHERE s.date >= $1';
      driverParams = [trendFrom];
    } else if (toDate) {
      driverWhere = 'WHERE s.date <= $1';
      driverParams = [trendTo];
    }
    const topDrivers = await prisma.$queryRawUnsafe(
      `
        SELECT d.id, u.name, COUNT(s.id) as shipmentCount
        FROM "Driver" d
        JOIN "user" u ON d."userId" = u.id
        LEFT JOIN "Shipment" s ON s."driverId" = d.id
        ${driverWhere}
        GROUP BY d.id, u.name
        ORDER BY shipmentCount DESC
        LIMIT 5;
      `,
      ...driverParams
    );

    // Top 5 vehicles by shipment count (filtered)
    let vehicleWhere = '';
    let vehicleParams = [];
    if (fromDate && toDate) {
      vehicleWhere = 'WHERE s.date >= $1 AND s.date <= $2';
      vehicleParams = [trendFrom, trendTo];
    } else if (fromDate) {
      vehicleWhere = 'WHERE s.date >= $1';
      vehicleParams = [trendFrom];
    } else if (toDate) {
      vehicleWhere = 'WHERE s.date <= $1';
      vehicleParams = [trendTo];
    }
    const topVehicles = await prisma.$queryRawUnsafe(
      `
        SELECT v.id, v.number, v.model, COUNT(s.id) as shipmentCount
        FROM "Vehicle" v
        LEFT JOIN "Shipment" s ON s."vehicleId" = v.id
        ${vehicleWhere}
        GROUP BY v.id, v.number, v.model
        ORDER BY shipmentCount DESC
        LIMIT 5;
      `,
      ...vehicleParams
    );

    // Average delivery time (filtered)
    let avgWhere = 'WHERE s.status IN (\'DELIVERED\', \'COMPLETED\')';
    let avgParams = [];
    if (fromDate && toDate) {
      avgWhere += ' AND s.date >= $1 AND s.date <= $2';
      avgParams = [trendFrom, trendTo];
    } else if (fromDate) {
      avgWhere += ' AND s.date >= $1';
      avgParams = [trendFrom];
    } else if (toDate) {
      avgWhere += ' AND s.date <= $1';
      avgParams = [trendTo];
    }
    const avgDeliveryTimeResult = await prisma.$queryRawUnsafe(
      `
        SELECT AVG(EXTRACT(EPOCH FROM (s."date" - s."createdAt"))) as avgSeconds
        FROM "Shipment" s
        ${avgWhere}
      `,
      ...avgParams
    );
    const avgDeliveryTimeSeconds = avgDeliveryTimeResult[0]?.avgseconds || 0;

    // 5 most recent shipments (filtered)
    const recentShipments = await prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { driver: { include: { user: true } }, vehicle: true },
    });

    // Convert BigInt values to Number or string for JSON serialization
    const safe = v => typeof v === 'bigint' ? Number(v) : v;
    const safeArray = arr => arr.map(obj => {
      const out = {};
      for (const k in obj) out[k] = safe(obj[k]);
      return out;
    });

    res.json({
      totalShipments: safe(totalShipments),
      shipmentsByStatus: safeArray(shipmentsByStatus),
      shipmentsByPaymentMethod: safeArray(shipmentsByPaymentMethod),
      totalRevenue: safe(totalRevenue),
      revenueByMonth: safeArray(revenueByMonth),
      shipmentsPerMonth: safeArray(shipmentsPerMonth),
      topDrivers: safeArray(topDrivers),
      topVehicles: safeArray(topVehicles),
      avgDeliveryTimeSeconds: safe(avgDeliveryTimeSeconds),
      recentShipments, // Should not contain BigInt fields
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getOverview }; 