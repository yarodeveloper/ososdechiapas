/**
 * Seed script — usa el schema real de alter_schema.sql
 * Ejecutar: npm run seed (desde /backend)
 */
const db = require('../config/db');

const seed = async () => {
  try {
    console.log('🌱 Iniciando seed...\n');

    // ── Categorías (sin min_age / max_age — no existen en el schema real) ───
    const categories = [
      ['Peewee',        'Categoría infantil'],
      ['Potrillos',     'Categoría infantil inicial'],
      ['Junior Bantam', 'Categoría pre-juvenil'],
      ['Bantam',        'Categoría juvenil inicial'],
      ['Juvenil',       'Categoría juvenil competitiva'],
      ['Flag',          'Tochito mixto'],
      ['Femenil',       'Varonil / Femenil - Equipado'],
    ];

    console.log('📂 Insertando categorías...');
    for (const [name, description] of categories) {
      await db.query(
        'INSERT INTO categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=name',
        [name, description]
      );
      console.log(`  ✅ ${name}`);
    }

    // ── Posiciones (por si no existen) ─────────────────────────────────────
    const positions = [
      'Quarterback (QB)', 'Running Back (RB)', 'Wide Receiver (WR)',
      'Tight End (TE)',   'Offensive Line (OL)', 'Linebacker (LB)',
      'Cornerback (CB)', 'Safety (S)',          'Defensive Line (DL)',
      'Kicker (K)',      'Punter (P)',
    ];

    console.log('\n🏈 Insertando posiciones...');
    for (const name of positions) {
      await db.query(
        'INSERT INTO catalogs_positions (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name',
        [name]
      );
      console.log(`  ✅ ${name}`);
    }

    // ── Tipos de sangre (por si no existen) ────────────────────────────────
    const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    console.log('\n🩸 Insertando tipos de sangre...');
    for (const name of bloodTypes) {
      await db.query(
        'INSERT INTO catalogs_blood_types (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name',
        [name]
      );
      console.log(`  ✅ ${name}`);
    }

    // ── Usuario admin de prueba ─────────────────────────────────────────────
    console.log('\n👤 Insertando usuario admin de prueba...');
    await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=name`,
      ['Admin Osos', 'admin@ososdechiapas.com', 'temp_password_hash', '9611234567', 'admin']
    );
    console.log('  ✅ admin@ososdechiapas.com');

    // ── Obtener IDs para insertar jugadores de prueba ───────────────────────
    const [[{ userId }]] = await db.query(
      "SELECT id as userId FROM users WHERE email = 'admin@ososdechiapas.com'"
    );
    const [[peewee]] = await db.query(
      "SELECT id FROM categories WHERE name = 'Peewee'"
    );
    const [[varsity]] = await db.query(
      "SELECT id FROM categories WHERE name = 'Juvenil'"
    );
    const [[qb]] = await db.query(
      "SELECT id FROM catalogs_positions WHERE name = 'Quarterback (QB)'"
    );
    const [[wr]] = await db.query(
      "SELECT id FROM catalogs_positions WHERE name = 'Wide Receiver (WR)'"
    );
    const [[rb]] = await db.query(
      "SELECT id FROM catalogs_positions WHERE name = 'Running Back (RB)'"
    );
    const [[oPos]] = await db.query(
      "SELECT id FROM catalogs_blood_types WHERE name = 'O+'"
    );
    const [[aPos]] = await db.query(
      "SELECT id FROM catalogs_blood_types WHERE name = 'A+'"
    );

    // ── Jugadores de prueba ─────────────────────────────────────────────────
    const players = [
      [1, 'Guillermo Ochoa Pérez',   '2014-05-15', 'OCPG140515HCSRLL09', qb.id,  peewee.id,  oPos.id, '9611234001'],
      [1, 'Roberto Sánchez López',   '2007-01-20', 'SALR070120HCSNCB08', rb.id,  varsity.id, aPos.id, '9611234002'],
      [1, 'Carlos Gómez Hernández',  '2008-11-10', 'GOMC081110HCSMRL07', wr.id,  varsity.id, oPos.id, '9611234003'],
      [1, 'Miguel Torres Ruíz',      '2015-03-08', 'TORM150308HCSNRG05', qb.id,  peewee.id,  aPos.id, '9611234004'],
    ];

    // ── Migrar tabla players al schema nuevo (si es DB local con schema viejo) ─
    console.log('\n🔧 Migrando schema de players...');
    const migrations = [
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS name VARCHAR(100)`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS curp VARCHAR(18)`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS position_id INT`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS blood_type_id INT`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20)`,
    ];
    for (const sql of migrations) {
      await db.query(sql).catch(() => {}); // Ignorar si ya existe
    }
    console.log('  ✅ Schema actualizado');

    console.log('\n🏈 Insertando jugadores de prueba...');
    await db.query('SET FOREIGN_KEY_CHECKS=0');
    for (const p of players) {
      await db.query(
        `INSERT INTO players (user_id, name, birth_date, curp, position_id, category_id, blood_type_id, emergency_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=name`,
        p
      );
      console.log(`  ✅ ${p[1]}`);
    }
    await db.query('SET FOREIGN_KEY_CHECKS=1');

    console.log('\n✅ Seed completado exitosamente.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error en el seed:', err.message);
    process.exit(1);
  }
};

seed();
