const db = require('../config/db');

// Get all parents (to populate the select field in the registration form)
const getAllParents = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE role = "parent"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving parents', error: error.message });
  }
};

module.exports = {
  getAllParents
};
