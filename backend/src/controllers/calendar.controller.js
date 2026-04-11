const db = require('../config/db');

const getEvents = async (req, res) => {
    try {
        const { category_id, history } = req.query;
        let query = `
            SELECT e.*, c.name as category_name, t.name as rival_name, t.logo_url as rival_logo,
            (SELECT COUNT(*) FROM player_stats ps WHERE ps.game_id = e.id) as stats_count
            FROM calendar_events e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN teams t ON e.rival_id = t.id
            WHERE e.is_active = 1
        `;
        const params = [];

        if (category_id) {
            query += " AND e.category_id = ?";
            params.push(category_id);
        }

        if (history === 'true') {
            query += " AND (e.start_time < NOW() OR e.score_osos IS NOT NULL)";
            query += " ORDER BY e.start_time DESC";
        } else if (history === 'false') {
            query += " AND e.start_time >= NOW() AND e.score_osos IS NULL";
            query += " ORDER BY e.start_time ASC";
        } else {
            query += " ORDER BY e.start_time DESC";
        }
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching calendar', error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, event_type, start_time, end_time, location_name, location_url, rival_id, category_id } = req.body;
        const [result] = await db.query(
            `INSERT INTO calendar_events (title, description, event_type, start_time, end_time, location_name, location_url, rival_id, category_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, event_type, start_time, end_time || null, location_name, location_url, rival_id || null, category_id || null]
        );

        if (req.io) {
            req.io.emit('new_event', { title, event_type });
        }
        
        res.status(201).json({ id: result.insertId, message: 'Evento agendado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

// General update for events (including scores and categories)
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Build dynamic query
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        
        if (fields.length === 0) return res.status(400).json({ message: 'Nada que actualizar' });

        await db.query(`UPDATE calendar_events SET ${fields} WHERE id = ?`, [...values, id]);
        res.json({ message: 'Evento actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE calendar_events SET is_active = 0 WHERE id = ?', [id]);
        res.json({ message: 'Evento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};

module.exports = { getEvents, createEvent, deleteEvent, updateEvent };
