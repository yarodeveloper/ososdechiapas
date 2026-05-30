const db = require('./src/config/db');
async function run() {
  try {
    await db.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER role");
    console.log("Migration successful");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log("Already exists");
    else console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
