const db = require('../config/db.js');

const getDashboardMatches = async (req, res) => {
  try {
    const nextMatchQuery = `
      SELECT m.*, 
             local.name as local_name, local.logo_url as local_logo, 
             visitor.name as visitor_name, visitor.logo_url as visitor_logo
      FROM matches m
      JOIN teams local ON m.local_team_id = local.id
      JOIN teams visitor ON m.visitor_team_id = visitor.id
      WHERE m.match_date > NOW()
      ORDER BY m.match_date ASC
      LIMIT 1
    `;
    const [nextMatchResult] = await db.query(nextMatchQuery);

    const lastResultsQuery = `
      SELECT m.*, 
             local.name as local_name, local.logo_url as local_logo, 
             visitor.name as visitor_name, visitor.logo_url as visitor_logo
      FROM matches m
      JOIN teams local ON m.local_team_id = local.id
      JOIN teams visitor ON m.visitor_team_id = visitor.id
      WHERE m.match_date < NOW()
      ORDER BY m.match_date DESC
      LIMIT 2
    `;
    const [lastResults] = await db.query(lastResultsQuery);

    res.status(200).json({
      nextMatch: nextMatchResult[0] || null,
      lastResults: lastResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error", error: error.message });
  }
};

const getLiveMatch = async (req, res) => {
    try {
        const liveQuery = `
            SELECT m.*, 
                   local.name as local_name, 
                   visitor.name as visitor_name
            FROM matches m
            JOIN teams local ON m.local_team_id = local.id
            JOIN teams visitor ON m.visitor_team_id = visitor.id
            WHERE m.match_date <= NOW() 
            AND m.result_status = 'PENDIENTE'
            ORDER BY m.match_date DESC
            LIMIT 1
        `;
        const [liveResult] = await db.query(liveQuery);
        
        if (liveResult.length > 0) {
            return res.status(200).json({
                ...liveResult[0],
                opponent: liveResult[0].visitor_name,
                home_score: liveResult[0].home_score,
                away_score: liveResult[0].visitor_score
            });
        }

        const lastQuery = `
            SELECT m.*, 
                   local.name as local_name, 
                   visitor.name as visitor_name
            FROM matches m
            JOIN teams local ON m.local_team_id = local.id
            JOIN teams visitor ON m.visitor_team_id = visitor.id
            ORDER BY m.match_date DESC
            LIMIT 1
        `;
        const [lastResult] = await db.query(lastQuery);
        
        res.status(200).json(lastResult[0] || { home_score: 24, away_score: 17, visitor_name: 'AGUILAS' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error", error: error.message });
    }
};

const getMatchDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const matchQuery = `
            SELECT m.*, 
                   local.name as local_name, 
                   visitor.name as visitor_name
            FROM matches m
            JOIN teams local ON m.local_team_id = local.id
            JOIN teams visitor ON m.visitor_team_id = visitor.id
            WHERE m.id = ?
        `;
        const [match] = await db.query(matchQuery, [id]);

        const playsQuery = `
            SELECT * FROM game_plays 
            WHERE match_id = ? 
            ORDER BY created_at DESC
        `;
        const [plays] = await db.query(playsQuery, [id]);

        res.status(200).json({
            ...match[0],
            playLog: plays
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLiveMatch = async (req, res) => {
    const { id } = req.params;
    const { home_score, away_score, time_left, current_quarter, possession, new_play } = req.body;

    try {
        await db.query(`
            UPDATE matches 
            SET home_score = ?, visitor_score = ?, time_left = ?, current_quarter = ?, possession = ?
            WHERE id = ?
        `, [home_score, away_score, time_left, current_quarter, possession, id]);

        if (new_play) {
            await db.query(`
                INSERT INTO game_plays (match_id, play_type, description, score_change, team, quarter, time_left)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, new_play.type, new_play.desc, new_play.score_change, new_play.team, current_quarter, time_left]);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getDashboardMatches, getLiveMatch, getMatchDetails, updateLiveMatch };
