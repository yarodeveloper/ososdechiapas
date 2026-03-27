const db = require('../config/db.js');

const getPositions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM catalogs_positions');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

const getBloodTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM catalogs_blood_types');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports = { getPositions, getBloodTypes };
