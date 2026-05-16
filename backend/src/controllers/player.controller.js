const db = require('../config/db.js');

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createPlayer = async (req, res) => {
  try {
    const { 
      name, birth_date, curp, position_id, category_id, 
      blood_type_id, emergency_phone, allergies, jersey_number,
      parent_name, parent_email, parent_phone, position_ids
    } = req.body;
    
    let photo_url = null;
    if (req.file) photo_url = `/uploads/images/${req.file.filename}`;

    if (!name || !parent_email || !parent_phone) {
      return res.status(400).json({ message: "Nombre del jugador, Correo y Teléfono del tutor son obligatorios" });
    }

    // 1. Manejo del Tutor (Padre)
    let parentId;
    let tempPassword = parent_phone || 'clubosos123';

    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [parent_email]);
    
    if (existingUser.length > 0) {
      parentId = existingUser[0].id;
    } else {
      // Crear nueva cuenta de familia
      const [userResult] = await db.query(
        'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [parent_name || 'Tutor Osos', parent_email, tempPassword, parent_phone || null, 'family']
      );
      parentId = userResult.insertId;
    }

    // 2. Crear Jugador
    const [playerResult] = await db.query(
      `INSERT INTO players (name, first_name, last_name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone, allergies, jersey_number, photo_url, user_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, '', '', birth_date || null, curp, position_id || null, category_id || null, blood_type_id || null, emergency_phone || null, allergies || null, jersey_number || null, photo_url, parentId, 'active']
    );

    const playerId = playerResult.insertId;

    // 3. Insertar Posiciones Múltiples
    if (position_ids && Array.isArray(position_ids)) {
       const posValues = position_ids.map(pid => [playerId, pid, pid == position_id]);
       if (posValues.length > 0) {
          await db.query('INSERT INTO player_positions (player_id, position_id, is_primary) VALUES ?', [posValues]);
       }
    } else if (position_id) {
       await db.query('INSERT INTO player_positions (player_id, position_id, is_primary) VALUES (?, ?, ?)', [playerId, position_id, true]);
    }

    res.status(201).json({ id: playerId, message: "Jugador creado con éxito" });
  } catch (error) {
    console.error('CREATE PLAYER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, birth_date, curp, position_id, category_id, blood_type_id, 
      emergency_phone, allergies, jersey_number, status, deactivation_reason,
      parent_name, parent_email, parent_phone, position_ids 
    } = req.body;

    // Check player exists
    const [existing] = await db.query('SELECT id, user_id, photo_url FROM players WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });

    let photo_url = existing[0].photo_url;
    if (req.file) photo_url = `/uploads/images/${req.file.filename}`;

    // Actualizar datos del jugador
    await db.query(
      `UPDATE players SET name=?, first_name=?, last_name=?, birth_date=?, curp=?, position_id=?, category_id=?, blood_type_id=?, emergency_phone=?, allergies=?, jersey_number=?, photo_url=?, status=?, deactivation_reason=?
       WHERE id=?`,
      [name, '', '', birth_date || null, curp, position_id || null, category_id || null, blood_type_id || null, emergency_phone || null, allergies || null, jersey_number || null, photo_url, status || 'active', deactivation_reason || null, id]
    );

    // Actualizar múltiples posiciones
    if (position_ids && Array.isArray(position_ids)) {
      await db.query('DELETE FROM player_positions WHERE player_id = ?', [id]);
      const posValues = position_ids.map(pid => [id, pid, pid == position_id]);
      if (posValues.length > 0) {
         await db.query('INSERT INTO player_positions (player_id, position_id, is_primary) VALUES ?', [posValues]);
      }
    }

    // Sync user status + update parent data
    if (existing[0].user_id) {
       const userIsActive = (status === 'baja') ? 0 : 1;
       await db.query('UPDATE users SET is_active=? WHERE id=?', [userIsActive, existing[0].user_id]);
       
       // Update parent data — only if email present to avoid NOT NULL violation
       if (existing[0].user_id !== 1 && parent_email) {
          const updateFields = [];
          const updateValues = [];
          if (parent_name !== undefined) { updateFields.push('name=?'); updateValues.push(parent_name || null); }
          updateFields.push('email=?'); updateValues.push(parent_email);
          if (parent_phone !== undefined){ updateFields.push('phone=?'); updateValues.push(parent_phone || null); }
          updateValues.push(existing[0].user_id);
          await db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id=?`, updateValues);
       }
    }

    res.json({ message: "Jugador actualizado con éxito" });
  } catch (error) {
    console.error('UPDATE PLAYER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── LIST ─────────────────────────────────────────────────────────────────────
const getPlayers = async (req, res) => {
  try {
    const [players] = await db.query(`
      SELECT p.*, c.name as category_name, pos.name as position_name,
      (
          SELECT GROUP_CONCAT(cp.name SEPARATOR ', ')
          FROM player_positions pp
          JOIN catalogs_positions cp ON pp.position_id = cp.id
          WHERE pp.player_id = p.id
      ) as display_positions
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      ORDER BY p.name ASC
    `);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DETAIL ───────────────────────────────────────────────────────────────────
const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [players] = await db.query(`
      SELECT p.*, c.name as category_name, pos.name as position_name,
             u.name as parent_name, u.email as parent_email, u.phone as parent_phone, u.password_hash as parent_password,
             (
                SELECT GROUP_CONCAT(pp.position_id)
                FROM player_positions pp
                WHERE pp.player_id = p.id
             ) as position_ids_list
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (players.length === 0) return res.status(404).json({ message: "No encontrado" });

    const player = players[0];
    player.position_ids = player.position_ids_list ? player.position_ids_list.split(',').map(Number) : [];

    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM players WHERE id = ?', [id]);
    res.json({ message: "Jugador eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── BY PARENT ────────────────────────────────────────────────────────────────
const getPlayersByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const [players] = await db.query(`
      SELECT p.*, c.name as category_name, pos.name as position_name,
      (
          SELECT GROUP_CONCAT(cp.name SEPARATOR ', ')
          FROM player_positions pp
          JOIN catalogs_positions cp ON pp.position_id = cp.id
          WHERE pp.player_id = p.id
      ) as display_positions
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      WHERE p.user_id = ?
      ORDER BY p.name ASC
    `, [parentId]);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── BY CATEGORY ──────────────────────────────────────────────────────────────
const getPlayersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [players] = await db.query(`
      SELECT p.*, c.name as category_name, pos.name as position_name,
      (
          SELECT GROUP_CONCAT(cp.name SEPARATOR ', ')
          FROM player_positions pp
          JOIN catalogs_positions cp ON pp.position_id = cp.id
          WHERE pp.player_id = p.id
      ) as display_positions
      FROM players p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
      WHERE p.category_id = ?
      ORDER BY p.name ASC
    `, [categoryId]);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPlayer, updatePlayer, getPlayers, getPlayerById, deletePlayer, getPlayersByParent, getPlayersByCategory };
