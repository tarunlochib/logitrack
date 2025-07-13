const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupDatabase() {
    try {
        console.log('Setting up database...');

        // Create default tenant
        let defaultTenant = await prisma.tenant.findFirst({
            where: { name: 'Default Tenant' }
        });

        if (!defaultTenant) {
            defaultTenant = await prisma.tenant.create({
                data: {
                    name: 'Default Tenant',
                    slug: 'default',
                    domain: null,
                    schemaName: 'default_tenant',
                    isActive: true,
                    settings: {
                        gstNumber: null,
                        phone: null,
                        address: null
                    }
                }
            });
            console.log('Default tenant created:', defaultTenant.name);
        } else {
            console.log('Default tenant already exists:', defaultTenant.name);
        }

        // Create superadmin user
        const existingSuperadmin = await prisma.user.findFirst({
            where: { role: 'SUPERADMIN' }
        });

        if (!existingSuperadmin) {
            const hashedPassword = await bcrypt.hash('superadmin123', 10);
            
            const superadmin = await prisma.user.create({
                data: {
                    name: 'Super Admin',
                    email: 'superadmin@logistics.com',
                    password: hashedPassword,
                    role: 'SUPERADMIN',
                    phone: '+1234567890',
                    tenantId: defaultTenant.id,
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
        } else {
            console.log('Superadmin already exists:', existingSuperadmin.email);
        }

        console.log('Database setup completed successfully!');
        
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupDatabase(); 