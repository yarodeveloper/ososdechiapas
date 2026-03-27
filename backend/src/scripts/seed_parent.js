const db = require('../config/db');

const seedParents = async () => {
  try {
    console.log('Insertando usuario de prueba...');
    
    await db.query(`
      INSERT INTO users (name, email, password_hash, phone, role) 
      VALUES ('Papá Oso', 'papa@osos.com', 'hashedpassword123', '9611234567', 'parent')
      ON DUPLICATE KEY UPDATE name=name
    `);

    console.log('✅ Padre insertado exitosamente (papa@osos.com).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en el sembrado:', err);
    process.exit(1);
  }
};

seedParents();
