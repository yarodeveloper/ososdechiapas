const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/leads - Create a new interest lead
router.post('/', async (req, res) => {
    const { name, email, phone, child_age, message } = req.body;
    
    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO leads (name, email, phone, child_age, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, child_age, message]
        );
        res.status(201).json({ id: result.insertId, message: 'Lead saved successfully' });
    } catch (err) {
        console.error('Error saving lead:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
