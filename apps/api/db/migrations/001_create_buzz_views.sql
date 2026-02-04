CREATE TABLE IF NOT EXISTS buzz_views (
  id SERIAL PRIMARY KEY,
  region VARCHAR(5) NOT NULL,
  media_type VARCHAR(10) NOT NULL,
  tmdb_id INTEGER NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region, media_type, tmdb_id)
);

CREATE INDEX IF NOT EXISTS idx_buzz_views_region ON buzz_views(region, media_type, tmdb_id);
