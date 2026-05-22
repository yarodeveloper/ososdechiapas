const db = require('../config/db');

// Get all parents (to populate the select field in the registration form)
const getAllParents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email FROM users WHERE role = 'parent' ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving parents', error: error.message });
  }
};

// Add a new parent
const createParent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Nombre, correo y teléfono son requeridos' });
    }

    // Role is hardcoded to 'parent' to match the database ENUM
    const role = 'parent';
    // Password is set to the phone number
    const password_hash = phone; 

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

// Update user password
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'La nueva contraseña es requerida' });
    }

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password, id]);

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('[updatePassword]', error);
    res.status(500).json({ message: 'Error al actualizar contraseña', error: error.message });
  }
};

module.exports = {
  getAllParents,
  createParent,
  updatePassword
};
