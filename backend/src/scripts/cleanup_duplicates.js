const db = require('./config/db');

const cleanup = async () => {
  try {
    console.log('🧹 Limpiando duplicados...');
    
    // 1. Limpiar Categorías
    await db.query(`
      DELETE t1 FROM categories t1
      INNER JOIN categories t2 
      WHERE t1.id < t2.id AND t1.name = t2.name
    `);
    
    // 2. Limpiar Posiciones
    await db.query(`
      DELETE t1 FROM catalogs_positions t1
      INNER JOIN catalogs_positions t2 
      WHERE t1.id < t2.id AND t1.name = t2.name
    `);

    // 3. Limpiar Tipos de Sangre
    await db.query(`
      DELETE t1 FROM catalogs_blood_types t1
      INNER JOIN catalogs_blood_types t2 
      WHERE t1.id < t2.id AND t1.name = t2.name
    `);

    console.log('✅ Base de datos limpia de duplicados.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error limpiando:', err.message);
    process.exit(1);
  }
};

cleanup();
