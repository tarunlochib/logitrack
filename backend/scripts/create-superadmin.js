const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSuperadmin() {
    try {
        // Check if superadmin already exists
        const existingSuperadmin = await prisma.user.findFirst({
            where: { role: 'SUPERADMIN' }
        });

        if (existingSuperadmin) {
            console.log('Superadmin already exists:', existingSuperadmin.email);
            return;
        }

        // Create superadmin user
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        
        const superadmin = await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: 'superadmin@logistics.com',
                password: hashedPassword,
                role: 'SUPERADMIN',
                phone: '+1234567890',
                tenantId: 1, // Default tenant ID (you may need to create a default tenant first)
                settings: {
                    emailNotifications: true,
                    pushNotifications: false,
                    twoFactorAuth: false,
                    sessionTimeout: 30,
                    language: 'en',
                    theme: 'light'
                }
            }
        });

        console.log('Superadmin created successfully:', superadmin.email);
        console.log('Default password: superadmin123');
        console.log('Please change the password after first login!');
        
    } catch (error) {
        console.error('Error creating superadmin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperadmin(); 