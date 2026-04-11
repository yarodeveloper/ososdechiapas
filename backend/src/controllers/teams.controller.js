const db = require('../config/db.js');

const createTeam = async (req, res) => {
  try {
    const { name, home_stadium, jersey_color_hex } = req.body;
    let logo_url = null;

    if (req.file) {
      logo_url = `/uploads/images/${req.file.filename}`;
    }

    if (!name) {
      return res.status(400).json({ message: "El nombre del equipo es obligatorio" });
    }

    const query = `
      INSERT INTO teams (name, logo_url, home_stadium, jersey_color_hex)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [name, logo_url, home_stadium || null, jersey_color_hex || '#e30514']);

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      logo_url, 
      home_stadium, 
      jersey_color_hex,
      message: "Equipo guardado correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el equipo", error: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM teams ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getTeams]', error);
    res.status(500).json({ message: "Error al obtener equipos", error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, home_stadium, jersey_color_hex } = req.body;
    let logo_url = req.body.logo_url;

    if (req.file) {
      logo_url = `/uploads/images/${req.file.filename}`;
    }

    const query = `
      UPDATE teams 
      SET name = ?, logo_url = ?, home_stadium = ?, jersey_color_hex = ?
      WHERE id = ?
    `;
    await db.query(query, [name, logo_url, home_stadium, jersey_color_hex, id]);

    res.status(200).json({ message: "Equipo actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    // Evitar borrar el equipo propio (id 1)
    if (id == 1) return res.status(403).json({ message: "No se puede borrar el equipo del club" });
    
    await db.query('DELETE FROM teams WHERE id = ?', [id]);
    res.status(200).json({ message: "Equipo eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTeam, getTeams, updateTeam, deleteTeam };
