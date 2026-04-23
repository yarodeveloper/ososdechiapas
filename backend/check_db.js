const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables);
        
        for (let t of tables) {
            const tableName = Object.values(t)[0];
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            console.log(`Columns for ${tableName}:`, columns.map(c => c.Field));
        }
        await connection.end();
    } catch (e) {
        console.error(e);
    }
}
check();
