const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Create a superadmin user (platform owner only)
const createSuperadminUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'SUPERADMIN',
        tenantId: null,
      },
    });
    res.status(201).json({ message: 'Superadmin user created', user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email or phone already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a tenant user (admin only)
const createTenantUser = async (req, res) => {
  const { name, email, phone, password, role, licenseNumber } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  // Only allow DISPATCHER and DRIVER roles
  const allowedRoles = ['DISPATCHER', 'DRIVER'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  // For DRIVER role, license number is required
  if (role === 'DRIVER' && !licenseNumber) {
    return res.status(400).json({ message: 'License number is required for drivers' });
  }
  // Only allow ADMINs to create users
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only ADMINs can create users' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        tenantId: req.user.tenantId, // Admin can only create users for their own tenant
      },
    });
    // If role is DRIVER, create a driver profile
    if (role === 'DRIVER') {
      await prisma.driver.create({
        data: {
          userId: user.id,
          name,
          phone,
          licenseNumber: licenseNumber,
          tenantId: req.user.tenantId,
        },
      });
    }
    res.status(201).json({ message: 'Tenant user created', user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email, phone, or license number already exists' });
    }
    console.error('Error creating tenant user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user status (isActive)
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
        const updated = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isActive }
        });
        res.json({ message: 'User status updated', user: updated });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user details (superadmin: any user, admin: only own tenant)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  const { name, email, role, phone } = req.body;
  try {
    // Only allow superadmin or admin (for their own tenant)
    if (requester.role !== 'SUPERADMIN' && requester.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Admin can only update users in their own tenant
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user || (requester.role === 'ADMIN' && user.tenantId !== requester.tenantId)) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, role, phone }
    });
    res.json({ message: 'User updated', user: updated });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID (superadmin: any user, admin: only own tenant)
const getUserById = async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  try {
    let where = { id: parseInt(id) };
    if (requester.role === 'ADMIN') {
      where.tenantId = requester.tenantId;
    } else if (requester.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { tenant: { select: { id: true, name: true, slug: true } } }
    });
    if (!user || (requester.role === 'ADMIN' && user.tenantId !== requester.tenantId)) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset user password (superadmin: any user, admin: only own tenant)
const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  // Generate a new random password
  const newPassword = Math.random().toString(36).slice(-8);
  try {
    if (requester.role !== 'SUPERADMIN' && requester.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user || (requester.role === 'ADMIN' && user.tenantId !== requester.tenantId)) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });
    res.json({ message: 'Password reset', newPassword });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createSuperadminUser, createTenantUser, updateUserStatus, getUserById, updateUser, resetUserPassword }; 