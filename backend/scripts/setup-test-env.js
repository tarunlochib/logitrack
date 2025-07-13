const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestEnvironment() {
    try {
        console.log('Setting up test environment...');

        // Create a test tenant
        let testTenant = await prisma.tenant.findFirst({
            where: { slug: 'test-tenant' }
        });

        if (!testTenant) {
            testTenant = await prisma.tenant.create({
                data: {
                    name: 'Test Transport Company',
                    slug: 'test-tenant',
                    domain: null,
                    schemaName: 'test_tenant',
                    isActive: true,
                    settings: {
                        gstNumber: 'GST123456789',
                        phone: '+919876543210',
                        address: '123 Transport Street, Mumbai'
                    }
                }
            });
            console.log('Test tenant created:', testTenant.name);
        } else {
            console.log('Test tenant already exists:', testTenant.name);
        }

        // Create a test admin user
        const existingTestUser = await prisma.user.findFirst({
            where: { email: 'admin@test-tenant.com' }
        });

        if (!existingTestUser) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const testUser = await prisma.user.create({
                data: {
                    name: 'Test Admin',
                    email: 'admin@test-tenant.com',
                    password: hashedPassword,
                    role: 'ADMIN',
                    phone: '+919876543210',
                    tenantId: testTenant.id,
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

            console.log('Test admin user created successfully:', testUser.email);
            console.log('Test credentials:');
            console.log('Email: admin@test-tenant.com');
            console.log('Password: admin123');
            console.log('Tenant Slug: test-tenant');
        } else {
            console.log('Test admin user already exists:', existingTestUser.email);
        }

        // Create some test vehicles
        const existingVehicles = await prisma.vehicle.findMany({
            where: { tenantId: testTenant.id }
        });

        if (existingVehicles.length === 0) {
            const vehicles = await Promise.all([
                prisma.vehicle.create({
                    data: {
                        number: 'MH01AB1234',
                        model: 'Tata 407',
                        capacity: 2,
                        isAvailable: true,
                        tenantId: testTenant.id
                    }
                }),
                prisma.vehicle.create({
                    data: {
                        number: 'MH02CD5678',
                        model: 'Mahindra Bolero',
                        capacity: 1.5,
                        isAvailable: true,
                        tenantId: testTenant.id
                    }
                })
            ]);

            console.log('Test vehicles created:', vehicles.length);
        } else {
            console.log('Test vehicles already exist:', existingVehicles.length);
        }

        console.log('\nTest environment setup completed!');
        console.log('\nTo test the application:');
        console.log('1. Login with: admin@test-tenant.com / admin123');
        console.log('2. The tenant slug should be: test-tenant');
        console.log('3. Check the browser console for API request debug info');
        
    } catch (error) {
        console.error('Error setting up test environment:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupTestEnvironment(); 