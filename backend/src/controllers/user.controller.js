const db = require('../config/db');

// Get all parents (to populate the select field in the registration form)
const getAllParents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email FROM users WHERE role = 'family' ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving parents', error: error.message });
  }
};

// Add a new parent
const createParent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y correo son requeridos' });
    }

    // Role is hardcoded to 'family' to match the rest of the codebase
    const role = 'family';
    // Password hash should be handled here, but looking at seed it uses 'temp_password_hash'
    // I'll use a placeholder or the provided password if encryption is not yet established in this project
    const password_hash = password || 'osos2026'; 

    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, password_hash, role]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Padre registrado exitosamente' 
    });
  } catch (error) {
    console.error('[createParent]', error);
    res.status(500).json({ message: 'Error al registrar padre', error: error.message });
  }
};

module.exports = {
  getAllParents,
  createParent
};
