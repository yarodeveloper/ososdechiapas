const db = require('./src/config/db');

async function seed() {
  try {
    console.log('--- Starting Database Seed ---');

    // 1. Categories
    const categories = [
      ['Tiny Tot', '4-6 años', 4, 6],
      ['Peewee', '7-9 años', 7, 9],
      ['Midget', '10-12 años', 10, 12],
      ['Junior Varsity', '13-15 años', 13, 15],
      ['Varsity', '16-18 años', 16, 18],
      ['Juvenil A', 'Temporada Primavera', 15, 17],
      ['Juvenil AA', 'Temporada Otoño', 16, 18],
      ['Intermedia', '18-21 años', 18, 21]
    ];

    console.log('Inserting categories...');
    await db.query('DELETE FROM player_stats');
    await db.query('DELETE FROM attendance');
    await db.query('DELETE FROM players');
    await db.query('DELETE FROM categories');
    
    for (const cat of categories) {
      await db.query('INSERT INTO categories (name, description, min_age, max_age) VALUES (?, ?, ?, ?)', cat);
    }

    // 2. Dummy Users (Admin, Coach, Parent)
    console.log('Inserting initial users...');
    await db.query('DELETE FROM users');
    const users = [
      ['Admin Osos', 'admin@ososdechiapas.com', 'admin_hash_here', '9611234567', 'admin'],
      ['Coach Roberto', 'roberto@ososdechiapas.com', 'coach_hash_here', '9617654321', 'coach'],
      ['Papá Juan', 'juan@parent.com', 'parent_hash_here', '9619876543', 'parent']
    ];

    const userMap = {};
    for (const u of users) {
      const [res] = await db.query('INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)', u);
      userMap[u[4]] = res.insertId;
    }

    // 3. Dummy Players
    console.log('Inserting dummy players...');
    const [catList] = await db.query('SELECT id, name FROM categories WHERE name = "Peewee" OR name = "Varsity"');
    const peeweeId = catList.find(c => c.name === 'Peewee').id;
    const varsityId = catList.find(c => c.name === 'Varsity').id;

    const dummyPlayers = [
      [userMap.parent, peeweeId, 'Memo', 'Ochoa', '2015-05-15', 'QB', 15, 'https://via.placeholder.com/150'],
      [userMap.parent, varsityId, 'Beto', 'Sánchez', '2008-01-20', 'RB', 22, 'https://via.placeholder.com/150'],
      [userMap.parent, varsityId, 'Carlos', 'Gómez', '2007-11-10', 'WR', 88, 'https://via.placeholder.com/150']
    ];

    for (const p of dummyPlayers) {
      await db.query('INSERT INTO players (user_id, category_id, first_name, last_name, birth_date, position, jersey_number, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', p);
    }

    console.log('--- Database Seed Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error during seed:', err);
    process.exit(1);
  }
}

seed();
