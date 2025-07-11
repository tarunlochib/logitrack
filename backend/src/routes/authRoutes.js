const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Existing routes
router.post('/signup', verifyToken, authorizeRoles('SUPERADMIN'), authController.signup);
router.post('/login', authController.login);

// New user management routes (now protected)
router.get('/settings', verifyToken, authController.getUserSettings);
router.put('/settings', verifyToken, authController.updateUserSettings);
router.put('/change-password', verifyToken, authController.changePassword);
router.get('/export-data', verifyToken, authController.exportUserData);
router.delete('/delete-account', verifyToken, authController.deleteAccount);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;