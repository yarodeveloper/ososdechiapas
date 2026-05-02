const db = require('../src/config/db');

async function applyMigrations() {
    console.log('--- Iniciando Sincronización de Base de Datos ---');
    
    const queries = [
        // 1. Columnas para Bajas y Seguridad
        {
            name: 'is_active en users',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER role`
        },
        {
            name: 'deactivation_reason en players',
            sql: `ALTER TABLE players ADD COLUMN IF NOT EXISTS deactivation_reason VARCHAR(255) DEFAULT NULL AFTER status`
        },
        {
            name: 'Actualizar ENUM status en players',
            sql: `ALTER TABLE players MODIFY COLUMN status ENUM('active', 'inactive', 'baja') DEFAULT 'active'`
        },

        // 2. Columnas para Estadísticas Desglosadas
        {
            name: 'td_offense en player_stats',
            sql: `ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS td_offense INT DEFAULT 0 AFTER touchdowns`
        },
        {
            name: 'td_defense en player_stats',
            sql: `ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS td_defense INT DEFAULT 0 AFTER td_offense`
        },
        // 3. Sistema de Ligas (Tabla)
        {
            name: 'Tabla leagues',
            sql: `CREATE TABLE IF NOT EXISTS leagues (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                logo_url VARCHAR(255),
                season_year YEAR,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        },
        // 4. Vincular Categorías con Ligas
        {
            name: 'league_id en categories',
            sql: `ALTER TABLE categories ADD COLUMN IF NOT EXISTS league_id INT AFTER id`
        },
        // 5. Tabla de Configuración (Settings)
        {
            name: 'Tabla settings',
            sql: `CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) UNIQUE NOT NULL,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`
        }
    ];

    for (const q of queries) {
        try {
            console.log(`Ejecutando: ${q.name}...`);
            await db.query(q.sql);
            console.log(`✅ OK: ${q.name}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate column name')) {
                console.log(`ℹ️ Saltado: ${q.name} (Ya existe)`);
            } else {
                console.error(`❌ ERROR en ${q.name}:`, err.message);
            }
        }
    }

    console.log('--- Sincronización Finalizada ---');
    process.exit(0);
}

applyMigrations();
