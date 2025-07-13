const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { identifyTenant } = require('../middlewares/tenantMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');

const EXPENSE_CATEGORIES = [
  'FUEL', 'MAINTENANCE', 'SALARY', 'TOLL', 'INSURANCE', 'OFFICE_SUPPLIES', 'REPAIR', 'PARKING', 'FINES', 'TAX', 'RENT', 'UTILITIES', 'LOAN_PAYMENT', 'COMMISSION', 'TRAINING', 'MEDICAL', 'OTHER'
];

const EXPENSE_STATUSES = ['PENDING', 'APPROVED', 'PAID', 'REJECTED'];

// Validation middleware for create (POST)
const validateExpenseCreate = [
  body('amount').isDecimal({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(EXPENSE_CATEGORIES).withMessage('Invalid category'),
  body('date').custom((value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }).withMessage('Invalid date format'),
  body('status').optional().isIn(EXPENSE_STATUSES).withMessage('Invalid status'),
  body('employeeId').optional().isString().withMessage('Invalid employeeId'),
  body('description').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for update (PUT)
const validateExpenseUpdate = [
  body('amount').optional().isDecimal({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn(EXPENSE_CATEGORIES).withMessage('Invalid category'),
  body('date').optional().custom((value) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }).withMessage('Invalid date format'),
  body('status').optional().isIn(EXPENSE_STATUSES).withMessage('Invalid status'),
  body('employeeId').optional().isString().withMessage('Invalid employeeId'),
  body('description').optional().isString(),
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

router.get('/', expenseController.listExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', validateExpenseCreate, expenseController.createExpense);
router.put('/:id', validateExpenseUpdate, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router; 