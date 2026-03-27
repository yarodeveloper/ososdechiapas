const db = require('../config/db');

const categories = [
  { name: 'Tiny Tot', description: 'Categoría para niños principiantes', min_age: 4, max_age: 6 },
  { name: 'Peewee', description: 'Categoría infantil inicial', min_age: 7, max_age: 8 },
  { name: 'Midget', description: 'Categoría infantil intermedia', min_age: 9, max_age: 10 },
  { name: 'Junior Bantam', description: 'Categoría pre-juvenil', min_age: 11, max_age: 12 },
  { name: 'Bantam', description: 'Categoría juvenil inicial', min_age: 13, max_age: 14 },
  { name: 'Juvenil', description: 'Categoría para adolescentes competitivos', min_age: 15, max_age: 17 },
  { name: 'Tochito Flag', description: 'Fútbol bandera, categoría mixta', min_age: 6, max_age: 99 }
];

const seedCategories = async () => {
  try {
    console.log('Iniciando el sembrado de categorías...');
    
    // Limpiar tabla (opcional)
    // await db.query('DELETE FROM categories');
    
    for (const cat of categories) {
       await db.query(
         'INSERT INTO categories (name, description, min_age, max_age) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name', 
         [cat.name, cat.description, cat.min_age, cat.max_age]
       );
       console.log(`✅ Categoría "${cat.name}" insertada.`);
    }

    console.log('--- Sembrado de categorías finalizado con éxito ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en el sembrado:', err);
    process.exit(1);
  }
};

seedCategories();
