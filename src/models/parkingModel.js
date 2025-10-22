const db = require('../db');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);
const insertStmt = db.prepare(`INSERT INTO parks (id, plate, phone, started_at, expires_at, amount, status, mpesa_checkout_request_id)
VALUES (@id, @plate, @phone, @started_at, @expires_at, @amount, @status, @mpesa_checkout_request_id)`);
const getByPlate = db.prepare(`SELECT * FROM parks WHERE plate = ? ORDER BY started_at DESC LIMIT 1`);
const getById = db.prepare(`SELECT * FROM parks WHERE id = ?`);
const expireOld = db.prepare(`UPDATE parks SET status = 'expired' WHERE expires_at < ? AND status = 'active'`);
module.exports = {
  create({ plate, phone, started_at, expires_at, amount, mpesa_checkout_request_id = null }) {
    const id = nanoid();
    insertStmt.run({ id, plate, phone, started_at, expires_at, amount, status: 'active', mpesa_checkout_request_id });
    return getById.get(id);
  },
  getLatestByPlate(plate) {
    expireOld.run(Date.now());
    return getByPlate.get(plate);
  },
  getById(id) { return getById.get(id); },
  markExtended(id, newExpiresAt, newAmount) {
    const stmt = db.prepare(`UPDATE parks SET expires_at = @expires_at, amount = @amount, status = 'active' WHERE id = @id`);
    stmt.run({ expires_at: newExpiresAt, amount: newAmount, id });
    return this.getById(id);
  },
  markExpired(id) {
    const stmt = db.prepare(`UPDATE parks SET status='expired' WHERE id = ?`);
    stmt.run(id);
  },
  listAll() {
    const s = db.prepare(`SELECT * FROM parks ORDER BY started_at DESC LIMIT 100`);
    return s.all();
  }
};
