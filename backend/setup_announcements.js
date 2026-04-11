const db = require('./src/config/db');

async function setup_announcements() {
    try {
        console.log('Creating announcements table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                tag VARCHAR(50) DEFAULT 'AVISO',
                tag_color VARCHAR(20) DEFAULT 'red',
                image_url VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Insert some dummy announcements
        const dummies = [
            ['Próxima Venta de Uniformes de Gala', 'Adquiere el nuevo kit oficial en las oficinas del club. Tallas disponibles para todas las categorías.', 'IMPORTANTE'],
            ['Cierre de Inscripciones Temporada', 'Última semana para completar la documentación oficial de los jugadores.', 'ADMIN']
        ];

        for (const [title, content, tag] of dummies) {
            await db.query(
                'INSERT INTO announcements (title, content, tag) VALUES (?, ?, ?)',
                [title, content, tag]
            );
        }

        console.log('Announcements table created and seeded!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

setup_announcements();
