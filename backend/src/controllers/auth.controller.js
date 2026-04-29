const db = require('../config/db');

/**
 * Handle user login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Find user by email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    
    // Check if user is active
    if (user.is_active === 0) {
      return res.status(401).json({ message: 'Tu acceso ha sido desactivado. Contacta a la administración.' });
    }

    // Simple password check (compare plain text for development)
    if (user.password_hash !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Success - In a real app, generate a JWT here
    // For now, we'll return user info
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        is_first_login: user.is_first_login === 1
      },
      token: 'mock-jwt-token-' + user.id // Placeholder token
    });

  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Handle forced password reset on first login
 */
const updateFirstPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'Usuario y nueva contraseña son requeridos' });
    }

    // In a real app we'd hash the new password using bcrypt
    const [result] = await db.query(
      'UPDATE users SET password_hash = ?, is_first_login = 0 WHERE id = ?',
      [newPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('[Update Password Error]', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  login,
  updateFirstPassword
};
