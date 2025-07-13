const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTenant() {
    try {
        console.log('=== Database Debug ===');
        
        // Check tenants
        const tenants = await prisma.tenant.findMany();
        console.log('\nTenants:', tenants);
        
        // Check users
        const users = await prisma.user.findMany({
            include: {
                tenant: true
            }
        });
        console.log('\nUsers:', users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            tenantId: u.tenantId,
            tenant: u.tenant ? {
                id: u.tenant.id,
                name: u.tenant.name,
                slug: u.tenant.slug
            } : null
        })));
        
        // Check if there are any vehicles
        const vehicles = await prisma.vehicle.findMany({
            include: {
                tenant: true
            }
        });
        console.log('\nVehicles:', vehicles.map(v => ({
            id: v.id,
            number: v.number,
            tenantId: v.tenantId,
            tenant: v.tenant ? {
                id: v.tenant.id,
                name: v.tenant.name,
                slug: v.tenant.slug
            } : null
        })));
        
    } catch (error) {
        console.error('Error debugging database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugTenant(); 