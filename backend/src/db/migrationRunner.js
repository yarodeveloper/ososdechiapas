const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    console.log('--- Iniciando Corredor de Migraciones ---');
    
    try {
        // 1. Asegurar tabla de control
        await db.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Leer archivos de la carpeta
        const migrationsDir = path.join(__dirname, '../../migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        // 3. Obtener migraciones ya ejecutadas
        const [executed] = await db.query('SELECT name FROM migrations');
        const executedNames = executed.map(m => m.name);

        // 4. Ejecutar las nuevas
        for (const file of files) {
            if (executedNames.includes(file)) {
                console.log(`ℹ️ Saltada: ${file} (Ya ejecutada)`);
                continue;
            }

            console.log(`🚀 Ejecutando: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            
            // Ejecutar por bloques si hay punto y coma (opcional, pero más seguro)
            const blocks = sql.split(';').filter(b => b.trim().length > 0);
            
            for (const block of blocks) {
                await db.query(block);
            }

            await db.query('INSERT INTO migrations (name) VALUES (?)', [file]);
            console.log(`✅ Completada: ${file}`);
        }

        console.log('--- Migraciones Finalizadas con Éxito ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR CRÍTICO EN MIGRACIÓN:', error.message);
        process.exit(1);
    }
}

runMigrations();
