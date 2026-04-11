const db = require('./src/config/db');

async function seed_matches() {
    try {
        console.log('Seeding matches and teams...');
        
        // Ensure local team exists
        await db.query(`INSERT IGNORE INTO teams (name, logo_url) VALUES ('Club Osos', '/logo_osos.webp')`);
        const [ososRow] = await db.query("SELECT id FROM teams WHERE name = 'Club Osos'");
        const ososId = ososRow[0].id;

        // Ensure visitor team exists
        await db.query(`INSERT IGNORE INTO teams (name, logo_url) VALUES ('Panteras', 'https://ui-avatars.com/api/?name=P&background=333&color=fff')`);
        const [panterasRow] = await db.query("SELECT id FROM teams WHERE name = 'Panteras'");
        const visitorId = panterasRow[0].id;

        // Add a match
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() + 3); // 3 days from now
        matchDate.setHours(18, 0, 0, 0);

        await db.query(`
            INSERT INTO matches (local_team_id, visitor_team_id, match_date, category_id, result_status)
            VALUES (?, ?, ?, 1, 'PENDIENTE')
        `, [ososId, visitorId, matchDate]);

        console.log('Match seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seed_matches();
