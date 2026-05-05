const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('--- Iniciando migración de tabla payments ---');
    
    const query = "ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'late', 'partially_paid', 'validating') DEFAULT 'pending'";
    
    await db.query(query);
    
    console.log('✅ Éxito: La columna "status" ha sido actualizada con el estado "validating".');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

migrate();
