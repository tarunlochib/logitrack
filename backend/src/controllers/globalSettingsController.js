const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/superadmin/settings
async function getGlobalSettings(req, res) {
  try {
    let settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      // If not found, create with defaults
      settings = await prisma.globalSettings.create({
        data: {
          id: 1,
          data: {
            platformName: '',
            supportEmail: '',
            defaultLanguage: 'en',
            theme: 'system',
            enableRegistration: true,
            maintenanceMode: false,
          },
        },
      });
    }
    res.json(settings.data);
  } catch (err) {
    console.error('Error fetching global settings:', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
}

// PUT /api/superadmin/settings
async function updateGlobalSettings(req, res) {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    const updated = await prisma.globalSettings.upsert({
      where: { id: 1 },
      update: { data },
      create: { id: 1, data },
    });
    res.json(updated.data);
  } catch (err) {
    console.error('Error updating global settings:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
}

module.exports = {
  getGlobalSettings,
  updateGlobalSettings,
}; 