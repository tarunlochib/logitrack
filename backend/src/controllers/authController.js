const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sign Up Controller

const signup = async (req, res) => {
    const {name, email, password, role, phone, licenseNumber, tenantId} = req.body;

    try {
        const existinguser  = await prisma.user.findUnique({ where: { email } });
        if(existinguser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Set tenantId to null for SUPERADMIN, otherwise use provided or request tenant
        const userTenantId = role === 'SUPERADMIN' ? null : (tenantId || req.tenant?.id);

        const user  = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                phone,
                tenantId: userTenantId
            }
        });

        // Only create Driver profile if role is DRIVER and not SUPERADMIN
        if (role === 'DRIVER' && userTenantId) {
            await prisma.driver.create({
                data: {
                    userId: user.id,
                    name,
                    phone,
                    licenseNumber,
                    tenantId: userTenantId
                }
            });
        }

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {   
        console.error('Error during sign up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Sign In Controller

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        isActive: true
                    }
                }
            }
        });
        
        if(!user) return res.status(404).json({ message: "user not found"});

        // Only check tenant for non-SUPERADMIN users
        if (user.role !== 'SUPERADMIN') {
            if (req.tenant && user.tenantId !== req.tenant.id) {
                return res.status(403).json({ message: 'Access denied for this tenant' });
            }
            if (user.tenant && !user.tenant.isActive) {
                return res.status(403).json({ message: 'Tenant account is inactive' });
            }
            if (!user.tenant) {
                return res.status(404).json({ message: 'Tenant not found' });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        };

        const token = jwt.sign({ 
            id: user.id, 
            role: user.role, 
            tenantId: user.tenantId 
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                tenantId: user.tenantId,
                tenant: user.tenant
            }
        }); 
    } catch (error) { 
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getDriverUsers = async (req, res) => {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: 'DRIVER' }
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user settings
const getUserSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                settings: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Default settings if none exist
        const defaultSettings = {
            emailNotifications: true,
            pushNotifications: false,
            twoFactorAuth: false,
            sessionTimeout: 30,
            language: 'en',
            theme: 'light'
        };

        res.json({
            user,
            settings: user.settings || defaultSettings
        });
    } catch (error) {
        console.error('Error getting user settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user settings
const updateUserSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { settings } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { settings },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                settings: true
            }
        });

        res.json({
            message: 'Settings updated successfully',
            settings: updatedUser.settings
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export user data
const exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user data with related information
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                driver: true,
                shipments: {
                    include: {
                        driver: true,
                        vehicle: true
                    }
                }
            }
        });

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove sensitive information
        const exportData = {
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phone: userData.phone,
                settings: userData.settings,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
            },
            driver: userData.driver,
            shipments: userData.shipments,
            exportDate: new Date().toISOString()
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="user-data-${userData.name}-${new Date().toISOString().split('T')[0]}.json"`);
        
        res.json(exportData);
    } catch (error) {
        console.error('Error exporting user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user has any active shipments
        const activeShipments = await prisma.shipment.findMany({
            where: {
                driverId: userId,
                status: {
                    in: ['PENDING', 'IN_TRANSIT']
                }
            }
        });

        if (activeShipments.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete account with active shipments. Please complete or reassign active shipments first.' 
            });
        }

        // Delete related data first (due to foreign key constraints)
        await prisma.shipment.deleteMany({
            where: { driverId: userId }
        });

        await prisma.driver.deleteMany({
            where: { userId: userId }
        });

        // Finally delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user profile (name, phone)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, phone },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true
            }
        });
        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    signup, 
    login, 
    getDriverUsers,
    getUserSettings,
    updateUserSettings,
    changePassword,
    exportUserData,
    deleteAccount,
    updateProfile
};