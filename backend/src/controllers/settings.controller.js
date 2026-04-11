const db = require('../config/db');

/**
 * Get all settings as a key-value object
 */
const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings', error: error.message });
  }
};

/**
 * Update multiple settings
 */
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Expecting { bank_name: '...', bank_clabe: '...' }
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object required' });
    }

    const queries = Object.entries(settings).map(([key, value]) => {
      return db.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    });

    await Promise.all(queries);

    res.json({ message: 'Configuración actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
