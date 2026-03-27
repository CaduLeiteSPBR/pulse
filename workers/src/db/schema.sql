-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  token_expires_at INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('trabalho', 'pessoal')),
  categoria TEXT,
  importancia INTEGER NOT NULL CHECK (importancia BETWEEN 1 AND 4),
  esforco_horas REAL NOT NULL,
  prazo TEXT,
  concluida INTEGER DEFAULT 0,
  concluida_em TEXT,
  justificativa_adiamento TEXT,
  criada_em TEXT DEFAULT (datetime('now')),
  atualizada_em TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_concluida ON tasks(concluida);
CREATE INDEX IF NOT EXISTS idx_tasks_prazo ON tasks(prazo);
CREATE INDEX IF NOT EXISTS idx_tasks_tipo ON tasks(tipo);
