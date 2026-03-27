const db = require('../config/db.js');

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createPlayer = async (req, res) => {
  try {
    const { name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone, allergies } = req.body;
    let photo_url = null;

    if (req.file) {
      photo_url = `/uploads/images/${req.file.filename}`;
    }

    if (!name || curp?.length !== 18) {
      return res.status(400).json({ message: "Nombre es obligatorio y CURP debe tener 18 caracteres" });
    }

    const user_id = 1;

    const [result] = await db.query(
      `INSERT INTO players (user_id, name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone, allergies, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, birth_date || null, curp, position_id || null, category_id || null, blood_type_id || null, emergency_phone || null, allergies || null, photo_url]
    );

    res.status(201).json({ id: result.insertId, name, curp, message: "Jugador guardado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el jugador", error: error.message });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
const getPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name, pos.name as position_name, bt.name as blood_type_name
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      LEFT JOIN catalogs_blood_types bt ON p.blood_type_id = bt.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo los jugadores", error: error.message });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name, pos.name as position_name, bt.name as blood_type_name
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      LEFT JOIN catalogs_blood_types bt ON p.blood_type_id = bt.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo el jugador", error: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone, allergies } = req.body;

    // Check player exists
    const [existing] = await db.query('SELECT id, photo_url FROM players WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });

    let photo_url = existing[0].photo_url;
    if (req.file) {
      photo_url = `/uploads/images/${req.file.filename}`;
    }

    await db.query(
      `UPDATE players SET name=?, birth_date=?, curp=?, position_id=?, category_id=?, blood_type_id=?, emergency_phone=?, allergies=?, photo_url=?
       WHERE id=?`,
      [name, birth_date || null, curp, position_id || null, category_id || null, blood_type_id || null, emergency_phone || null, allergies || null, photo_url, id]
    );

    res.status(200).json({ message: "Jugador actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando el jugador", error: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM players WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });

    await db.query('DELETE FROM players WHERE id = ?', [id]);
    res.status(200).json({ message: "Jugador eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando el jugador", error: error.message });
  }
};

module.exports = { createPlayer, getPlayers, getPlayerById, updatePlayer, deletePlayer };
