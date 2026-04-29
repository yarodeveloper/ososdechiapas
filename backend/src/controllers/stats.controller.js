const db = require('../config/db');

// Catálogos
const getStatsCatalogs = async (req, res) => {
    try {
        const [leagues] = await db.query('SELECT * FROM leagues');
        const [categories] = await db.query('SELECT * FROM categories');
        const data = leagues.map(l => ({ ...l, categories: categories.filter(c => c.league_id === l.id) }));
        res.json(data);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// Leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { category_id } = req.params;
        const { sortBy } = req.query; 
        let ord = 'total_touchdowns';
        if (sortBy === 'yards') ord = 'total_yards';
        if (sortBy === 'tackles') ord = 'total_tackles';

        const [rows] = await db.query(`
            SELECT 
                p.id, p.name, p.photo_url, pos.name as position_name,
                SUM(s.touchdowns) as total_touchdowns,
                SUM(s.td_offense) as total_td_offense,
                SUM(s.td_defense) as total_td_defense,
                SUM(s.yards_passing + s.yards_rushing + s.yards_receiving) as total_yards,
                SUM(s.tackles) as total_tackles,
                (SELECT COUNT(*) FROM player_stats WHERE player_id = p.id AND is_mvp = 1) as mvp_count
            FROM players p
            JOIN player_stats s ON p.id = s.player_id
            LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
            WHERE p.category_id = ? AND p.status = 'active'
            GROUP BY p.id
            ORDER BY ${ord} DESC
            LIMIT 10
        `, [category_id]);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// Global MVPs (Across all categories)
const getGlobalMvps = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id, p.name, p.photo_url, pos.name as position_name, c.name as category_name,
                (SELECT COUNT(*) FROM player_stats WHERE player_id = p.id AND is_mvp = 1) as mvp_count
            FROM players p
            JOIN (
                SELECT player_id, COUNT(*) as m_count FROM player_stats WHERE is_mvp = 1 GROUP BY player_id
            ) as m ON p.id = m.player_id
            LEFT JOIN catalogs_positions pos ON p.position_id = pos.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'active'
            ORDER BY m.m_count DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// Stats del Partido
const getMatchStats = async (req, res) => {
    try {
        const { event_id } = req.params;
        const [rows] = await db.query(`
            SELECT s.*, p.name as player_name, p.jersey_number as player_number
            FROM player_stats s
            JOIN players p ON s.player_id = p.id
            WHERE s.game_id = ?
        `, [event_id]);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// GUARDAR STATS (CON ERROR REVELADOR)
const savePlayerStats = async (req, res) => {
    try {
        const { 
            player_id, event_id, yards_passing, yards_rushing, yards_receiving, 
            touchdowns, td_offense, td_defense, tackles, interceptions, sacks, points_extra, is_mvp 
        } = req.body;

        const yp = parseInt(yards_passing) || 0;
        const yr = parseInt(yards_rushing) || 0;
        const yrec = parseInt(yards_receiving) || 0;
        const td_off = parseInt(td_offense) || 0;
        const td_def = parseInt(td_defense) || 0;
        const tds = td_off + td_def; // Calculate total TDs
        const tck = parseInt(tackles) || 0;
        const ints = parseInt(interceptions) || 0;
        const sks = parseInt(sacks) || 0;
        const ext = parseInt(points_extra) || 0;
        const mvp = (is_mvp === true || is_mvp === 1 || is_mvp === 'true') ? 1 : 0;

        const [existing] = await db.query('SELECT id FROM player_stats WHERE player_id = ? AND game_id = ?', [player_id, event_id]);

        if (existing.length > 0) {
            await db.query(`
                UPDATE player_stats SET 
                yards_passing=?, yards_rushing=?, yards_receiving=?, touchdowns=?, td_offense=?, td_defense=?, tackles=?, interceptions=?, sacks=?, points_extra=?, is_mvp=?
                WHERE id=?
            `, [yp, yr, yrec, tds, td_off, td_def, tck, ints, sks, ext, mvp, existing[0].id]);
        } else {
            await db.query(`
                INSERT INTO player_stats (player_id, game_id, yards_passing, yards_rushing, yards_receiving, touchdowns, td_offense, td_defense, tackles, interceptions, sacks, points_extra, is_mvp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [player_id, event_id, yp, yr, yrec, tds, td_off, td_def, tck, ints, sks, ext, mvp]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('SQL ERROR:', error);
        res.status(500).json({ 
            success: false, 
            message: 'ERROR SQL DETECTADO', 
            error: error.message,
            sqlMessage: error.sqlMessage 
        });
    }
};

const getPlayerResume = async (req, res) => {
    try {
        const { player_id } = req.params;
        const [player] = await db.query(`
            SELECT p.*, c.name as category_name, 
                   u.name as parent_name, u.email as parent_email, u.phone as parent_phone, u.password_hash as parent_password 
            FROM players p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [player_id]);
        if (player.length === 0) return res.status(404).json({ message: 'No existe' });
        
        const [stats] = await db.query(`
            SELECT 
                SUM(touchdowns) as total_tds, 
                SUM(td_offense) as total_td_offense,
                SUM(td_defense) as total_td_defense,
                SUM(yards_passing+yards_rushing+yards_receiving) as total_yards,
                SUM(tackles) as total_tackles,
                (SELECT COUNT(*) FROM player_stats WHERE player_id = ? AND is_mvp = 1) as mvp_count
            FROM player_stats WHERE player_id = ?
        `, [player_id, player_id]);
        
        const [history] = await db.query(`
            SELECT s.*, e.title as event_title, e.start_time as event_date
            FROM player_stats s JOIN calendar_events e ON s.game_id = e.id
            WHERE s.player_id = ? ORDER BY e.start_time DESC
        `, [player_id]);

        res.json({ ...player[0], ...stats[0], history });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getMatchStats, savePlayerStats, getPlayerResume, getStatsCatalogs, getLeaderboard, getGlobalMvps };
