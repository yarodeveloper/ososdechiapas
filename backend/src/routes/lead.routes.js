const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/leads - Create a new interest lead (Public)
router.post('/', async (req, res) => {
    const { name, email, phone, child_age, message } = req.body;
    
    if (!name || !phone) {
        return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO leads (name, email, phone, child_age, message) VALUES (?, ?, ?, ?, ?)',
            [name, email || null, phone, child_age || null, message || null]
        );
        
        const newId = result.insertId;

        // Emitir notificación en tiempo real a los administradores
        if (req.io) {
            req.io.emit('new_lead', { 
                id: newId, 
                name, 
                message: '¡Nuevo interesado registrado!' 
            });
        }

        res.status(201).json({ id: newId, message: 'Prospecto guardado correctamente' });
    } catch (err) {
        console.error('Error saving lead:', err);
        res.status(500).json({ error: 'Error al guardar el prospecto' });
    }
});

// GET /api/leads - List all leads (Admin)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching leads:', err);
        res.status(500).json({ error: 'Error al obtener los prospectos' });
    }
});

// PUT /api/leads/:id - Update lead status (Admin)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Estatus requerido' });

    try {
        await db.query('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Estatus actualizado' });
    } catch (err) {
        console.error('Error updating lead:', err);
        res.status(500).json({ error: 'Error al actualizar el prospecto' });
    }
});

// DELETE /api/leads/:id - Delete a lead (Admin)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM leads WHERE id = ?', [id]);
        res.json({ message: 'Prospecto eliminado' });
    } catch (err) {
        console.error('Error deleting lead:', err);
        res.status(500).json({ error: 'Error al eliminar el prospecto' });
    }
});

module.exports = router;
