const db = require('../config/db');

// --- CATEGORIES ---

const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
        SELECT c.*, l.name as league_name 
        FROM categories c
        LEFT JOIN leagues l ON c.league_id = l.id
        ORDER BY l.name ASC, c.name ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
};

const createCategory = async (req, res) => {
    try {
        const { name, league_id, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO categories (name, league_id, description) VALUES (?, ?, ?)',
            [name, league_id, description]
        );
        res.status(201).json({ id: result.insertId, name, message: 'Categoría creada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, league_id, description } = req.body;
        await db.query(
            'UPDATE categories SET name = ?, league_id = ?, description = ? WHERE id = ?',
            [name, league_id, description, id]
        );
        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- LEAGUES ---

const getAllLeagues = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM leagues ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createLeague = async (req, res) => {
    try {
        const { name, season_year } = req.body;
        const [result] = await db.query(
            'INSERT INTO leagues (name, season_year) VALUES (?, ?)',
            [name, season_year]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLeague = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, season_year } = req.body;
        await db.query(
            'UPDATE leagues SET name = ?, season_year = ? WHERE id = ?',
            [name, season_year, id]
        );
        res.json({ message: 'Liga actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteLeague = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM leagues WHERE id = ?', [id]);
        res.json({ message: 'Liga eliminada' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar la liga porque hay categorías asignadas a ella. Elimina las categorías primero.' });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllLeagues,
  createLeague,
  updateLeague,
  deleteLeague
};
