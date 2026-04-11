const db = require('../config/db.js');

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createPlayer = async (req, res) => {
  try {
    const { 
      name, birth_date, curp, position_id, category_id, 
      blood_type_id, emergency_phone, allergies, jersey_number,
      parent_name, parent_email, parent_phone 
    } = req.body;
    
    let photo_url = null;
    if (req.file) photo_url = `/uploads/images/${req.file.filename}`;

    if (!name || !parent_email) {
      return res.status(400).json({ message: "Nombre del jugador y Correo del tutor son obligatorios" });
    }

    // 1. Manejo del Tutor (Padre)
    let parentId;
    let isNewAccount = false;
    let tempPassword = parent_phone || 'clubosos123';

    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [parent_email]);
    
    if (existingUser.length > 0) {
      parentId = existingUser[0].id;
    } else {
      // Crear nueva cuenta de familia
      const [userResult] = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [parent_name || 'Tutor Osos', parent_email, tempPassword, 'family']
      );
      parentId = userResult.insertId;
      isNewAccount = true;
    }

    // 2. Registrar Jugador vinculado al parentId
    const [result] = await db.query(
      `INSERT INTO players (user_id, name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone, allergies, jersey_number, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [parentId, name, birth_date || null, curp || null, position_id || null, category_id || null, blood_type_id || null, emergency_phone, allergies || null, jersey_number || null, photo_url]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: "Jugador y Tutor vinculados correctamente",
      credentials: {
        email: parent_email,
        password: tempPassword,
        isNew: isNewAccount,
        parentName: parent_name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el jugador y tutor", error: error.message });
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
    const { 
      name, birth_date, curp, position_id, category_id, blood_type_id, 
      emergency_phone, allergies, jersey_number, 
      parent_name, parent_email, parent_phone 
    } = req.body;

    // Check player exists
    const [existing] = await db.query('SELECT id, user_id, photo_url FROM players WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });

    let photo_url = existing[0].photo_url;
    if (req.file) {
      photo_url = `/uploads/images/${req.file.filename}`;
    }

    // Actualizar datos del jugador
    await db.query(
      `UPDATE players SET name=?, birth_date=?, curp=?, position_id=?, category_id=?, blood_type_id=?, emergency_phone=?, allergies=?, jersey_number=?, photo_url=?
       WHERE id=?`,
      [name, birth_date || null, curp, position_id || null, category_id || null, blood_type_id || null, emergency_phone || null, allergies || null, jersey_number || null, photo_url, id]
    );

    // Update parent data or create new parent if none exists or assigned to Admin
    if (existing[0].user_id && existing[0].user_id !== 1) {
       await db.query('UPDATE users SET name=?, email=?, phone=? WHERE id=?', [parent_name || null, parent_email || null, parent_phone || null, existing[0].user_id]);
    } else if (parent_name || parent_email || parent_phone) {
        let parentId;
        if (parent_email) {
           const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [parent_email]);
           if (existingUser.length > 0) parentId = existingUser[0].id;
        }
        
        if (!parentId) {
           const tempPassword = parent_phone || 'clubosos123';
           const emailToUse = parent_email || `tutor_player${id}@osos.com`;
           const nameToUse = parent_name || 'Tutor Osos';
           const [userResult] = await db.query(
              'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
              [nameToUse, emailToUse, tempPassword, parent_phone || null, 'family']
           );
           parentId = userResult.insertId;
        }
        await db.query('UPDATE players SET user_id=? WHERE id=?', [parentId, id]);
    }

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

// ─── GET BY PARENT (For Portal) ──────────────────────────────────────────────
const getPlayersByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.name as category_name, 
        pos.name as position_name,
        SUM(pp.touchdowns) as total_tds,
        SUM(pp.yards_rushing) as total_rushing,
        SUM(pp.yards_passing) as total_passing,
        SUM(pp.yards_receiving) as total_receiving,
        SUM(pp.tackles) as total_tackles
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      LEFT JOIN player_performance pp ON p.id = pp.player_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.name ASC
    `, [parentId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getPlayersByParent]', error);
    res.status(500).json({ message: "Error obteniendo los hijos del usuario", error: error.message });
  }
};

// ─── GET BY CATEGORY ──────────────────────────────────────────────────────────
const getPlayersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await db.query(`
      SELECT p.*, pos.name as position_name
      FROM players p
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      WHERE p.category_id = ?
      ORDER BY p.name ASC
    `, [categoryId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getPlayersByCategory]', error);
    res.status(500).json({ message: "Error obteniendo los jugadores por categoría", error: error.message });
  }
};

module.exports = { 
  createPlayer, 
  getPlayers, 
  getPlayerById, 
  updatePlayer, 
  deletePlayer,
  getPlayersByParent,
  getPlayersByCategory
};
