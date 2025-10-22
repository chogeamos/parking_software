CREATE TABLE IF NOT EXISTS parks (
  id TEXT PRIMARY KEY,
  plate TEXT NOT NULL,
  phone TEXT,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  mpesa_checkout_request_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_plate ON parks(plate);
