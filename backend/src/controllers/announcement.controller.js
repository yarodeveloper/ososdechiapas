const db = require('../config/db');

const getAnnouncements = async (req, res) => {
  try {
    // We only retrieve active announcements that haven't expired
    const [rows] = await db.query(`
      SELECT * FROM announcements 
      WHERE is_active = 1 
      AND (expires_at IS NULL OR expires_at >= CURDATE())
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving announcements', error: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, tag, tag_color, expires_at } = req.body;
    let image_url = null;

    if (req.file) {
        image_url = `/uploads/images/${req.file.filename}`;
    }

    const [result] = await db.query(
      'INSERT INTO announcements (title, content, tag, tag_color, image_url, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, tag || 'AVISO', tag_color || 'red', image_url, expires_at || null]
    );

    req.io.emit('new_announcement', { title, tag });
    
    res.status(201).json({ id: result.insertId, message: 'Comunicado creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear comunicado', error: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE announcements SET is_active = 0 WHERE id = ?', [id]);
    res.json({ message: 'Comunicado eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar comunicado', error: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
