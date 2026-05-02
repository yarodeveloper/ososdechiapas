const db = require('../src/config/db');

async function fixStatus() {
    try {
        console.log('Updating players.status ENUM...');
        
        // 1. Update ENUM to include 'active', 'inactive', 'baja'
        // Using MODIFY instead of ADD because it's an existing column
        await db.query(`
            ALTER TABLE players 
            MODIFY COLUMN status ENUM('active', 'inactive', 'baja') DEFAULT 'active'
        `);

        console.log('✅ Column players.status updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating status column:', err.message);
        process.exit(1);
    }
}

fixStatus();
