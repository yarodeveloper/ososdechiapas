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
        avatar_url: user.avatar_url
      },
      token: 'mock-jwt-token-' + user.id // Placeholder token
    });

  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  login
};
