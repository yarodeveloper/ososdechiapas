const db = require('./src/config/db');

async function setup_settings() {
    try {
        console.log('Creating settings table in OSOS_DB...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) UNIQUE NOT NULL,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Insert default bank settings if they don't exist
        const defaults = [
            ['bank_name', 'BBVA MÉXICO'],
            ['bank_holder', 'CLUB OSOS DE CHIAPAS AC'],
            ['bank_clabe', '0121 2345 6789 0123 45']
        ];

        for (const [key, val] of defaults) {
            await db.query(
                'INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)',
                [key, val]
            );
        }

        console.log('Settings table and defaults created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

setup_settings();
