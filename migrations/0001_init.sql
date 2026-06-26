CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TEXT NOT NULL,
  locale TEXT DEFAULT 'vi',
  premium INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  meal_slug TEXT NOT NULL,
  PRIMARY KEY (user_id, meal_slug)
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_created ON meal_plans(user_id, created_at DESC);
