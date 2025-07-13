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

    // Build where clause for Prisma with tenant filtering
    const where = { tenantId: req.tenant.id };
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
      WHERE date >= ${trendFrom} AND date <= ${trendTo} AND "tenantId" = ${req.tenant.id}
      GROUP BY month
      ORDER BY month ASC;
    `;

    // Shipments per month (filtered)
    const shipmentsPerMonth = await prisma.$queryRaw`
      SELECT to_char(date, 'YYYY-MM') as month, COUNT(*) as count
      FROM "Shipment"
      WHERE date >= ${trendFrom} AND date <= ${trendTo} AND "tenantId" = ${req.tenant.id}
      GROUP BY month
      ORDER BY month ASC;
    `;

    // Top 5 drivers by shipment count (filtered)
    let driverWhere = 'WHERE d."tenantId" = $1';
    let driverParams = [req.tenant.id];
    if (fromDate && toDate) {
      driverWhere += ' AND s.date >= $2 AND s.date <= $3';
      driverParams = [req.tenant.id, trendFrom, trendTo];
    } else if (fromDate) {
      driverWhere += ' AND s.date >= $2';
      driverParams = [req.tenant.id, trendFrom];
    } else if (toDate) {
      driverWhere += ' AND s.date <= $2';
      driverParams = [req.tenant.id, trendTo];
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
    let vehicleWhere = 'WHERE v."tenantId" = $1';
    let vehicleParams = [req.tenant.id];
    if (fromDate && toDate) {
      vehicleWhere += ' AND s.date >= $2 AND s.date <= $3';
      vehicleParams = [req.tenant.id, trendFrom, trendTo];
    } else if (fromDate) {
      vehicleWhere += ' AND s.date >= $2';
      vehicleParams = [req.tenant.id, trendFrom];
    } else if (toDate) {
      vehicleWhere += ' AND s.date <= $2';
      vehicleParams = [req.tenant.id, trendTo];
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
    let avgWhere = 'WHERE s.status IN (\'DELIVERED\', \'COMPLETED\') AND s."tenantId" = $1';
    let avgParams = [req.tenant.id];
    if (fromDate && toDate) {
      avgWhere += ' AND s.date >= $2 AND s.date <= $3';
      avgParams = [req.tenant.id, trendFrom, trendTo];
    } else if (fromDate) {
      avgWhere += ' AND s.date >= $2';
      avgParams = [req.tenant.id, trendFrom];
    } else if (toDate) {
      avgWhere += ' AND s.date <= $2';
      avgParams = [req.tenant.id, trendTo];
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

// Get analytics data for admin dashboard
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const tenantId = req.user.tenantId;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get shipments data
    const shipments = await prisma.shipment.findMany({
      where: {
        tenantId,
        ...dateFilter,
      },
    });

    // Get expenses data
    const expenses = await prisma.expense.findMany({
      where: {
        transporterId: tenantId,
        ...dateFilter,
      },
    });

    // Calculate revenue (from shipments)
    const totalRevenue = shipments.reduce((sum, shipment) => sum + Number(shipment.grandTotal), 0);
    const completedRevenue = shipments
      .filter(s => s.status === 'COMPLETED' || s.status === 'DELIVERED')
      .reduce((sum, shipment) => sum + Number(shipment.grandTotal), 0);
    const pendingRevenue = shipments
      .filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS')
      .reduce((sum, shipment) => sum + Number(shipment.grandTotal), 0);

    // Calculate expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const paidExpenses = expenses
      .filter(e => e.status === 'PAID')
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const pendingExpenses = expenses
      .filter(e => e.status === 'PENDING')
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    // Calculate profit/loss
    const netProfit = completedRevenue - paidExpenses;
    const grossProfit = totalRevenue - totalExpenses;

    // Expense breakdown by category
    const expenseByCategory = {};
    expenses.forEach(expense => {
      const category = expense.category;
      if (!expenseByCategory[category]) {
        expenseByCategory[category] = 0;
      }
      expenseByCategory[category] += Number(expense.amount);
    });

    // Monthly breakdown
    const monthlyData = {};
    shipments.forEach(shipment => {
      const month = shipment.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }
      monthlyData[month].revenue += Number(shipment.grandTotal);
    });

    expenses.forEach(expense => {
      const month = expense.date.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }
      monthlyData[month].expenses += Number(expense.amount);
    });

    res.json({
      revenue: {
        total: totalRevenue,
        completed: completedRevenue,
        pending: pendingRevenue,
      },
      expenses: {
        total: totalExpenses,
        paid: paidExpenses,
        pending: pendingExpenses,
        byCategory: expenseByCategory,
      },
      profit: {
        net: netProfit,
        gross: grossProfit,
        margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0,
      },
      monthly: monthlyData,
      shipmentCount: shipments.length,
      expenseCount: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get detailed P&L report
const getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    const tenantId = req.user.tenantId;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get shipments and expenses
    const shipments = await prisma.shipment.findMany({
      where: {
        tenantId,
        ...dateFilter,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        transporterId: tenantId,
        ...dateFilter,
      },
      include: {
        employee: true,
      },
    });

    // Calculate revenue breakdown
    const revenueByStatus = {
      completed: shipments.filter(s => s.status === 'COMPLETED' || s.status === 'DELIVERED'),
      pending: shipments.filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS'),
    };

    const revenueByPaymentMethod = {
      paid: shipments.filter(s => s.paymentMethod === 'PAID'),
      toPay: shipments.filter(s => s.paymentMethod === 'TO_PAY'),
      toBeBilled: shipments.filter(s => s.paymentMethod === 'TO_BE_BILLED'),
    };

    // Calculate expenses by category and status
    const expensesByCategory = {};
    const expensesByStatus = {
      paid: expenses.filter(e => e.status === 'PAID'),
      pending: expenses.filter(e => e.status === 'PENDING'),
      approved: expenses.filter(e => e.status === 'APPROVED'),
      rejected: expenses.filter(e => e.status === 'REJECTED'),
    };

    expenses.forEach(expense => {
      const category = expense.category;
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = [];
      }
      expensesByCategory[category].push(expense);
    });

    // Calculate totals
    const totalRevenue = shipments.reduce((sum, s) => sum + Number(s.grandTotal), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Group by time period
    const groupedData = {};
    const addToGroup = (date, revenue, expense) => {
      let key;
      if (groupBy === 'month') {
        key = date.toISOString().slice(0, 7); // YYYY-MM
      } else if (groupBy === 'quarter') {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        key = `${date.getFullYear()}-Q${quarter}`;
      } else {
        key = date.toISOString().slice(0, 4); // YYYY
      }

      if (!groupedData[key]) {
        groupedData[key] = { revenue: 0, expenses: 0, profit: 0 };
      }
      groupedData[key].revenue += revenue;
      groupedData[key].expenses += expense;
      groupedData[key].profit = groupedData[key].revenue - groupedData[key].expenses;
    };

    shipments.forEach(shipment => {
      addToGroup(shipment.date, Number(shipment.grandTotal), 0);
    });

    expenses.forEach(expense => {
      addToGroup(expense.date, 0, Number(expense.amount));
    });

    res.json({
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0,
      },
      revenue: {
        byStatus: revenueByStatus,
        byPaymentMethod: revenueByPaymentMethod,
        total: totalRevenue,
      },
      expenses: {
        byCategory: expensesByCategory,
        byStatus: expensesByStatus,
        total: totalExpenses,
      },
      grouped: groupedData,
      shipments: shipments.length,
      expenses: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching P&L report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getOverview, getAnalytics, getProfitLossReport }; 