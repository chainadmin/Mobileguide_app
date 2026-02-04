ALTER TABLE buzz_votes ADD COLUMN IF NOT EXISTS region VARCHAR(5) DEFAULT 'US';

DROP INDEX IF EXISTS idx_buzz_votes_media;

ALTER TABLE buzz_votes DROP CONSTRAINT IF EXISTS buzz_votes_media_type_tmdb_id_key;

ALTER TABLE buzz_votes ADD CONSTRAINT buzz_votes_unique_region UNIQUE(media_type, tmdb_id, region);

CREATE INDEX idx_buzz_votes_region ON buzz_votes(region, media_type, tmdb_id);
