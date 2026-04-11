const db = require('../config/db');

const getSocialPosts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM social_posts WHERE is_active = 1 ORDER BY created_at DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const addSocialPost = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ message: 'URL de Instagram inválida' });
        }
        await db.query('INSERT INTO social_posts (url) VALUES (?)', [url]);
        res.status(201).json({ success: true, message: 'Post destacado agregado exitosamente' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteSocialPost = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE social_posts SET is_active = 0 WHERE id = ?', [id]);
        res.json({ success: true, message: 'Post removido del muro' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getSocialPosts, addSocialPost, deleteSocialPost };
