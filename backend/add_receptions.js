const db = require('./src/config/db.js');

async function migrate() {
    try {
        console.log('Adding receptions column to player_stats...');
        await db.query(`ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS receptions INT DEFAULT 0 AFTER yards_receiving`);
        console.log('Migration successful.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
