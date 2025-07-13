const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { createSuperadminUser, createTenantUser, updateUserStatus, getUserById, updateUser, resetUserPassword } = require('../controllers/userController');

// Superadmin-only user creation
router.post('/superadmin-create-user', verifyToken, requireRole('SUPERADMIN'), createSuperadminUser);

// Tenant admin user creation
router.post('/', verifyToken, requireRole('ADMIN'), createTenantUser);

router.get('/:id', verifyToken, getUserById);

router.patch('/:id/status', updateUserStatus);
router.patch('/:id', verifyToken, updateUser);
router.post('/:id/reset-password', verifyToken, resetUserPassword);

module.exports = router; 