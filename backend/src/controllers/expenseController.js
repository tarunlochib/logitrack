const { PrismaClient, Decimal } = require('@prisma/client');
const prisma = new PrismaClient();

// List all expenses for a tenant, with optional filters
exports.listExpenses = async (req, res) => {
  try {
    const { category, employeeId } = req.query;
    const where = { transporterId: req.tenant.id };
    if (category) where.category = category;
    if (employeeId) where.employeeId = employeeId;
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { employee: true },
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error listing expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Get a single expense by ID
exports.getExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: { employee: true },
    });
    if (!expense || expense.transporterId !== req.tenant.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const data = req.body;
    
    // Handle date conversion with better validation
    if (data.date) {
      const dateValue = new Date(data.date);
      if (isNaN(dateValue.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      data.date = dateValue;
    } else {
      // Set default date to today if not provided
      data.date = new Date();
    }
    
    // Handle amount conversion
    if (data.amount) {
      data.amount = new Decimal(data.amount);
    }
    
    const expense = await prisma.expense.create({
      data: {
        ...data,
        transporterId: req.tenant.id,
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure expense belongs to tenant
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.transporterId !== req.tenant.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    const data = req.body;
    
    // Handle date conversion with better validation
    if (data.date) {
      const dateValue = new Date(data.date);
      if (isNaN(dateValue.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      data.date = dateValue;
    }
    
    // Handle amount conversion
    if (data.amount) {
      data.amount = new Decimal(data.amount);
    }
    
    const expense = await prisma.expense.update({
      where: { id },
      data: data,
    });
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure expense belongs to tenant
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.transporterId !== req.tenant.id) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    await prisma.expense.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
}; 