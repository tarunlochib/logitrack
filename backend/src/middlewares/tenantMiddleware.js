const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to identify tenant from subdomain or custom header
const identifyTenant = async (req, res, next) => {
    try {
        // PROD DEBUG LOGGING
        console.log('PROD DEBUG: All headers:', req.headers);
        let tenantSlug = null;

        // Method 1: Extract from subdomain
        const host = req.get('host');
        if (host && host.includes('.')) {
            const subdomain = host.split('.')[0];
            if (subdomain !== 'www' && subdomain !== 'api') {
                tenantSlug = subdomain;
            }
        }

        // Method 2: Extract from custom header
        if (!tenantSlug) {
            tenantSlug = req.get('X-Tenant-Slug');
        }

        // Method 3: Extract from URL path (for API routes)
        if (!tenantSlug && req.path.startsWith('/api/tenant/')) {
            const pathParts = req.path.split('/');
            if (pathParts.length >= 4) {
                tenantSlug = pathParts[3];
            }
        }

        // Method 4: Extract from query parameter
        if (!tenantSlug) {
            tenantSlug = req.query.tenant;
        }

        console.log('PROD DEBUG: Received tenantSlug:', tenantSlug);

        if (tenantSlug) {
            // Find tenant by slug
            const tenant = await prisma.tenant.findUnique({
                where: { slug: tenantSlug },
                select: { id: true, name: true, slug: true, isActive: true }
            });

            console.log('PROD DEBUG: Tenant found:', tenant);

            if (!tenant) {
                return res.status(404).json({ message: 'Tenant not found' });
            }

            if (!tenant.isActive) {
                return res.status(403).json({ message: 'Tenant account is inactive' });
            }

            // Attach tenant info to request
            req.tenant = tenant;
        }

        next();
    } catch (error) {
        console.error('Error identifying tenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to ensure tenant is identified
const requireTenant = (req, res, next) => {
    if (!req.tenant) {
        return res.status(400).json({ message: 'Tenant identification required' });
    }
    next();
};

// Middleware to filter data by tenant
const filterByTenant = (req, res, next) => {
    if (req.tenant) {
        // Add tenant filter to query parameters
        req.tenantFilter = { tenantId: req.tenant.id };
    }
    next();
};

// Middleware to add tenant ID to request body for creation
const addTenantToBody = (req, res, next) => {
    if (req.tenant && req.method === 'POST') {
        req.body.tenantId = req.tenant.id;
    }
    next();
};

module.exports = {
    identifyTenant,
    requireTenant,
    filterByTenant,
    addTenantToBody
}; 