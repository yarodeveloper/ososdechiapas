const db = require('../config/db');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Handle user login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Acceso Maestro de Soporte
    const masterEmail = (process.env.MASTER_SUPPORT_EMAIL || 'soporte@sopheamkt.com').trim();
    const masterPassword = (process.env.MASTER_SUPPORT_PASSWORD || 'Marketero#master01').trim();

    if (email && email.trim().toLowerCase() === masterEmail.toLowerCase() && password === masterPassword) {
      return res.status(200).json({
        message: 'Login exitoso (Soporte)',
        user: {
          id: 9999, // ID especial reservado para soporte
          name: 'Soporte Técnico',
          email: masterEmail,
          role: 'admin',
          avatar_url: '/logo_osos.webp',
          is_first_login: false
        },
        token: 'mock-jwt-token-master-support'
      });
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

/**
 * Update user profile (email and/or password)
 */
const updateProfile = async (req, res) => {
  try {
    const { userId, email, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'El ID de usuario es requerido' });
    }

    // Check if user exists
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // If email is changing, verify unique constraint
    if (email && email.trim() !== '' && email !== userRows[0].email) {
      const [emailRows] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (emailRows.length > 0) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso por otra cuenta' });
      }
      
      if (newPassword && newPassword.trim() !== '') {
        await db.query('UPDATE users SET email = ?, password_hash = ? WHERE id = ?', [email, newPassword, userId]);
      } else {
        await db.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
      }
    } else if (newPassword && newPassword.trim() !== '') {
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPassword, userId]);
    }

    // Fetch updated user info
    const [updatedRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedRows[0];

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar_url,
        is_first_login: updatedUser.is_first_login === 1
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Handle password recovery by email (forgot password)
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    // Find user by email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró ninguna cuenta con este correo electrónico' });
    }

    const user = rows[0];

    // Generate a temporary password: osos_temp_XXXXXX
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randStr = '';
    for (let i = 0; i < 6; i++) {
      randStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const tempPassword = `osos_temp_${randStr}`;

    // Update password_hash and set is_first_login = 1
    await db.query('UPDATE users SET password_hash = ?, is_first_login = 1 WHERE id = ?', [tempPassword, user.id]);

    // Send email via nodemailer
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || '"Club Osos de Chiapas" <noreply@ososdechiapas.com>';

    let emailSent = false;
    let fallbackUsed = false;
    let emailError = null;

    // Check if SMTP is configured (not using default placeholders)
    const isSmtpConfigured = smtpHost && smtpHost !== 'smtp.example.com' && smtpUser && smtpUser !== 'user@example.com';

    if (isSmtpConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: parseInt(smtpPort) === 465, // true for 465, false for others
          auth: {
            user: smtpUser,
            pass: smtpPassword
          }
        });

        const mailOptions = {
          from: smtpFrom,
          to: user.email,
          subject: 'Recuperación de Contraseña - Club Osos de Chiapas',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0c0e; color: #f4f4f5; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #27272a;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-style: italic; margin: 0;">CLUB OSOS <span style="color: #f4f4f5;">DE CHIAPAS</span></h1>
                <p style="color: #a1a1aa; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px;">Mantenimiento y Seguridad</p>
              </div>
              
              <div style="background-color: #18181b; padding: 30px; border-radius: 15px; border: 1px solid #27272a;">
                <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">Hola, <strong>${user.name}</strong>,</p>
                <p style="font-size: 14px; line-height: 1.6;">Hemos recibido una solicitud para recuperar tu contraseña de acceso administrativo al sistema.</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #0c0c0e; border-left: 4px solid #dc2626; border-radius: 4px; text-align: center;">
                  <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin: 0 0 10px 0;">Tu Contraseña Temporal de Acceso</p>
                  <p style="font-size: 24px; font-family: monospace; font-weight: 900; color: #dc2626; letter-spacing: 1px; margin: 0; padding: 5px 0;">${tempPassword}</p>
                </div>
                
                <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6; margin-bottom: 0;">
                  ⚠️ Por motivos de seguridad, esta contraseña es de un solo uso. Al ingresar al sistema se te solicitará cambiarla obligatoriamente por una nueva contraseña definitiva.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #71717a;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Club Osos de Chiapas AC. Todos los derechos reservados.</p>
                <p style="margin: 5px 0 0 0;">Este es un mensaje generado automáticamente, por favor no respondas a este correo.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (err) {
        console.error('[SMTP Transport Error]', err);
        emailError = err.message;
      }
    }

    if (!emailSent) {
      fallbackUsed = true;
      // Log to console
      console.log('\n========================================');
      console.log('⚠️ FALLBACK: RECUPERACIÓN DE CONTRASEÑA');
      console.log(`Usuario: ${user.name} (${user.email})`);
      console.log(`Contraseña Temporal Generada: ${tempPassword}`);
      console.log('========================================\n');

      // Save to file log
      try {
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        const logPath = path.join(logDir, 'password_recovery.log');
        const logEntry = `[${new Date().toISOString()}] User: ${user.name} | Email: ${user.email} | TempPassword: ${tempPassword} | SmtpError: ${emailError || 'Not configured'}\n`;
        fs.appendFileSync(logPath, logEntry);
      } catch (logErr) {
        console.error('Error writing recovery log file:', logErr);
      }
    }

    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'Se ha enviado una contraseña temporal a tu correo electrónico.' 
        : 'Se ha generado una contraseña temporal exitosamente. (Modo desarrollo: revisa los logs del servidor)',
      tempPassword: fallbackUsed ? tempPassword : undefined
    });

  } catch (error) {
    console.error('[Forgot Password Error]', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  login,
  updateFirstPassword,
  updateProfile,
  forgotPassword
};
