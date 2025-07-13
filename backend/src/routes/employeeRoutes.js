const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { identifyTenant } = require('../middlewares/tenantMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');

const EMPLOYEE_ROLES = [
  'DRIVER', 'LOADER', 'MANAGER', 'SUPERVISOR', 'ACCOUNTANT', 'CLEANER', 'MECHANIC', 'SECURITY', 'HELPER', 'OTHER'
];
const EMPLOYEE_STATUS = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];

// Validation middleware
const validateEmployee = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('role').isIn(EMPLOYEE_ROLES).withMessage('Invalid role'),
  body('salary').isDecimal({ gt: 0 }).withMessage('Salary must be a positive number'),
  body('aadharNumber').optional().isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be 12 digits'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().isLength({ min: 8 }).withMessage('Invalid phone'),
  body('status').optional().isIn(EMPLOYEE_STATUS).withMessage('Invalid status'),
  body('dateOfJoining').optional().isISO8601().withMessage('Invalid dateOfJoining'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// All routes require tenant and auth middleware
router.use(authMiddleware.verifyToken, identifyTenant);

router.get('/', employeeController.listEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', validateEmployee, employeeController.createEmployee);
router.put('/:id', validateEmployee, employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router; 