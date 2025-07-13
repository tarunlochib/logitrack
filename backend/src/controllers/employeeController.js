const { PrismaClient, Decimal } = require('@prisma/client');
const prisma = new PrismaClient();

// List all employees for a tenant
exports.listEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { transporterId: req.tenant.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(employees);
  } catch (error) {
    console.error('Error listing employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Get a single employee by ID
exports.getEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
    });
    if (!employee || employee.transporterId !== req.tenant.id) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const data = req.body;
    
    // Convert dateOfJoining string to DateTime if provided
    if (data.dateOfJoining) {
      data.dateOfJoining = new Date(data.dateOfJoining);
    }
    
    // Convert salary to Decimal
    if (data.salary) {
      data.salary = new Decimal(data.salary);
    }
    
    const employee = await prisma.employee.create({
      data: {
        ...data,
        transporterId: req.tenant.id,
      },
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure employee belongs to tenant
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.transporterId !== req.tenant.id) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const data = req.body;
    
    // Convert dateOfJoining string to DateTime if provided
    if (data.dateOfJoining) {
      data.dateOfJoining = new Date(data.dateOfJoining);
    }
    
    // Convert salary to Decimal
    if (data.salary) {
      data.salary = new Decimal(data.salary);
    }
    
    const employee = await prisma.employee.update({
      where: { id },
      data: data,
    });
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure employee belongs to tenant
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.transporterId !== req.tenant.id) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await prisma.employee.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
}; 