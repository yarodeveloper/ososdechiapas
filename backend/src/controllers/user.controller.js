const db = require('../config/db');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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

// ── Coaches ──────────────────────────────────────────────────────────────
const getAllCoaches = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, phone, avatar_url, status FROM users WHERE role = 'coach' ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving coaches', error: error.message });
  }
};

const createCoach = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y correo son requeridos' });
    }

    const role = 'coach';
    const password_hash = password || 'coachOsos'; 

    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, password_hash, role, avatar_url || null]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Coach registrado exitosamente' 
    });
  } catch (error) {
    console.error('[createCoach]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }
    res.status(500).json({ message: 'Error al registrar coach', error: error.message });
  }
};

const updateCoachStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Estatus inválido' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ? AND role = "coach"', [status, id]);
    res.json({ success: true, message: 'Estatus actualizado' });
  } catch (error) {
    console.error('[updateCoachStatus]', error);
    res.status(500).json({ message: 'Error al actualizar estatus', error: error.message });
  }
};

const getCoachCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT name, email, phone, password_hash FROM users WHERE id = ? AND role = "coach"', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Coach no encontrado' });
    }
    const coach = rows[0];
    
    res.status(200).json({ 
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        password: coach.password_hash
    });
  } catch (error) {
    console.error('[getCoachCredentials]', error);
    res.status(500).json({ message: 'Error al obtener credenciales', error: error.message });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ? AND role = "coach"', [id]);
    res.json({ success: true, message: 'Coach eliminado' });
  } catch (error) {
    console.error('[deleteCoach]', error);
    res.status(500).json({ message: 'Error al eliminar coach', error: error.message });
  }
};

module.exports = {
  getAllParents,
  createParent,
  updatePassword,
  getAllCoaches,
  createCoach,
  updateCoachStatus,
  deleteCoach,
  getCoachCredentials
};
