CREATE TABLE IF NOT EXISTS agent_claims (
  claim_token TEXT PRIMARY KEY NOT NULL,
  user_code TEXT NOT NULL UNIQUE,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_claims_user_code ON agent_claims (user_code);
CREATE INDEX IF NOT EXISTS idx_agent_claims_expires_at ON agent_claims (expires_at);
