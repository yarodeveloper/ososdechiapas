const db = require('../config/db.js');

const createPlayer = async (req, res) => {
  try {
    const { name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone } = req.body;
    let photo_url = null;

    if (req.file) {
      photo_url = `/uploads/images/${req.file.filename}`;
    }

    if (!name || curp?.length !== 18) {
      return res.status(400).json({ message: "Nombre es obligatorio y CURP debe tener 18 caracteres" });
    }

    const user_id = 1;

    const query = `
      INSERT INTO players (user_id, name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      user_id, 
      name, 
      birth_date || null, 
      curp, 
      position_id || null, 
      category_id || null, 
      blood_type_id || null, 
      emergency_phone || null, 
      photo_url
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      name,
      curp,
      message: "Jugador guardado exitosamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el jugador", error: error.message });
  }
};

const getPlayers = async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.name as category_name, pos.name as position_name
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo los jugadores", error: error.message });
  }
};

module.exports = { createPlayer, getPlayers };
