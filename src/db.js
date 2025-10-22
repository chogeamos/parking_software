const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const DB_FILE = process.env.DATABASE_FILE || './data/kparking.db';
if (!fs.existsSync(path.dirname(DB_FILE))) fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new Database(DB_FILE);
function migrate() {
  const initSqlPath = path.join(__dirname, '..', 'migrations', 'init.sql');
  const sql = fs.readFileSync(initSqlPath, 'utf8');
  db.exec(sql);
  console.log('Migration executed.');
}
if (require.main === module) { migrate(); process.exit(0); }
module.exports = db;
