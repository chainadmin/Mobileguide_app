CREATE TABLE IF NOT EXISTS buzz_votes (
  id SERIAL PRIMARY KEY,
  media_type VARCHAR(10) NOT NULL,
  tmdb_id INTEGER NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(media_type, tmdb_id)
);

CREATE INDEX idx_buzz_votes_media ON buzz_votes(media_type, tmdb_id);
