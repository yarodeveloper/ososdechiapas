const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('Adding avatar_url to users table...');
        await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;');
        console.log('Migration successful!');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column avatar_url already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
