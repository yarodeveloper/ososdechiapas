const db = require('../src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Add is_active to users
        console.log('Adding is_active to users...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER role
        `);

        // 2. Add deactivation_reason to players
        console.log('Adding deactivation_reason to players...');
        await db.query(`
            ALTER TABLE players 
            ADD COLUMN IF NOT EXISTS deactivation_reason VARCHAR(255) DEFAULT NULL AFTER status
        `);

        // 3. Add td_offense and td_defense to player_stats
        console.log('Adding td_offense and td_defense to player_stats...');
        await db.query(`
            ALTER TABLE player_stats 
            ADD COLUMN IF NOT EXISTS td_offense INT DEFAULT 0 AFTER touchdowns,
            ADD COLUMN IF NOT EXISTS td_defense INT DEFAULT 0 AFTER td_offense
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
