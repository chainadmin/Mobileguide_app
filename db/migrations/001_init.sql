-- Initial placeholder migration
CREATE TABLE IF NOT EXISTS watchlist_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
