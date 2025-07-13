const express = require('express');
const router = express.Router();
const { getAnalytics, getProfitLossReport } = require('../controllers/analyticsController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get analytics data (for dashboard)
router.get('/', verifyToken, getAnalytics);

// Get detailed P&L report
router.get('/profit-loss', verifyToken, getProfitLossReport);

module.exports = router; 