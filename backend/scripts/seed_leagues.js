const db = require('../src/config/db');

async function seedLeagues() {
    try {
        console.log('Insertando ligas...');
        await db.query(`
            INSERT IGNORE INTO leagues (name, season_year, is_active) VALUES 
            ('Liga ACHFA', 2026, 1),
            ('Liga OFACH', 2026, 1),
            ('Circuito de Amistad', 2026, 1)
        `);
        
        console.log('Vinculando categorías a la primera liga por defecto...');
        await db.query('UPDATE categories SET league_id = 1 WHERE league_id IS NULL');
        
        console.log('✅ Ligas sincronizadas con éxito');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

seedLeagues();
