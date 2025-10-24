// db.js - adaptive SQLite for local + Vercel environments
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Detect environment
const isVercel = !!process.env.VERCEL;

// Choose database file path
const DB_FILE = isVercel
  ? ':memory:' // in-memory DB for Vercel
  : (process.env.DATABASE_FILE || './data/kparking.db');

// Ensure local directory exists
if (!isVercel && !fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

const db = new Database(DB_FILE);

// Migration
function migrate() {
  const initSqlPath = path.join(__dirname, '..', 'migrations', 'init.sql');
  if (!fs.existsSync(initSqlPath)) {
    console.warn('⚠️  migrations/init.sql not found — skipping migration.');
    return;
  }

  const sql = fs.readFileSync(initSqlPath, 'utf8');
  db.exec(sql);
  console.log('✅ Migration executed on', isVercel ? 'Vercel (in-memory)' : DB_FILE);
}

// Run migration automatically (once per function invocation)
try {
  migrate();
} catch (err) {
  console.error('Migration error:', err.message);
}

module.exports = db;
