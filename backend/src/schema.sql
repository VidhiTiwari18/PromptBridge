CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  source        TEXT NOT NULL,
  title         TEXT,
  raw_messages  JSONB NOT NULL,
  message_count INTEGER,
  captured_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS summaries (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  summary_text    TEXT NOT NULL,
  token_estimate  INTEGER,
  model_used      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
  id           SERIAL PRIMARY KEY,
  summary_id   INTEGER REFERENCES summaries(id) ON DELETE CASCADE,
  target       TEXT NOT NULL,
  transferred_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_conversation ON summaries(conversation_id);