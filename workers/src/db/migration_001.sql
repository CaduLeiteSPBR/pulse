-- Migration 001: suporte a login com email/senha
-- Recria a tabela users com google_id nullable e campo password_hash

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS users_v2 (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  password_hash TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  token_expires_at INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO users_v2 (id, google_id, email, name, picture, password_hash,
  google_access_token, google_refresh_token, token_expires_at, created_at, updated_at)
SELECT id, google_id, email, name, picture, NULL,
  google_access_token, google_refresh_token, token_expires_at, created_at, updated_at
FROM users;

DROP TABLE users;

ALTER TABLE users_v2 RENAME TO users;

PRAGMA foreign_keys = ON;
