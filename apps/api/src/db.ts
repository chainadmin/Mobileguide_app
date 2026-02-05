import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function query(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result;
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS buzz_views (
      id SERIAL PRIMARY KEY,
      region VARCHAR(5) NOT NULL,
      media_type VARCHAR(10) NOT NULL,
      tmdb_id INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(region, media_type, tmdb_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_buzz_views_region ON buzz_views(region, media_type, tmdb_id)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlists (
      id SERIAL PRIMARY KEY,
      guest_id VARCHAR(36) NOT NULL,
      tmdb_id INTEGER NOT NULL,
      media_type VARCHAR(10) NOT NULL,
      title VARCHAR(255) NOT NULL,
      poster_path VARCHAR(255),
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(guest_id, tmdb_id, media_type)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_watchlists_guest ON watchlists(guest_id)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cached_trending (
      id SERIAL PRIMARY KEY,
      region VARCHAR(5) NOT NULL,
      media_type VARCHAR(10) NOT NULL,
      time_window VARCHAR(10) NOT NULL DEFAULT 'day',
      data JSONB NOT NULL,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(region, media_type, time_window)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_cached_trending_lookup ON cached_trending(region, media_type, time_window)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cached_titles (
      id SERIAL PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,
      media_type VARCHAR(10) NOT NULL,
      data JSONB NOT NULL,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tmdb_id, media_type)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_cached_titles_lookup ON cached_titles(tmdb_id, media_type)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cached_providers (
      id SERIAL PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,
      media_type VARCHAR(10) NOT NULL,
      region VARCHAR(5) NOT NULL,
      data JSONB NOT NULL,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tmdb_id, media_type, region)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_cached_providers_lookup ON cached_providers(tmdb_id, media_type, region)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcast_shows (
      id BIGINT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      image VARCHAR(1000),
      language VARCHAR(10),
      country VARCHAR(5),
      author VARCHAR(500),
      feed_url VARCHAR(1000),
      episode_count INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcast_episodes (
      id BIGINT PRIMARY KEY,
      show_id BIGINT NOT NULL REFERENCES podcast_shows(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      image VARCHAR(1000),
      date_published BIGINT,
      audio_url VARCHAR(1000),
      duration INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_podcast_episodes_show ON podcast_episodes(show_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_podcast_episodes_date ON podcast_episodes(date_published DESC)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcast_follows (
      id SERIAL PRIMARY KEY,
      guest_id VARCHAR(36) NOT NULL,
      show_id BIGINT NOT NULL REFERENCES podcast_shows(id) ON DELETE CASCADE,
      region VARCHAR(5) NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(guest_id, show_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_podcast_follows_guest ON podcast_follows(guest_id)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcast_events (
      id SERIAL PRIMARY KEY,
      guest_id VARCHAR(36),
      region VARCHAR(5) NOT NULL,
      event_type VARCHAR(20) NOT NULL,
      show_id BIGINT,
      episode_id BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_podcast_events_region ON podcast_events(region, created_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_podcast_events_type ON podcast_events(event_type, created_at DESC)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcast_buzz_cache (
      id SERIAL PRIMARY KEY,
      region VARCHAR(5) NOT NULL,
      entity_type VARCHAR(10) NOT NULL,
      entity_id BIGINT NOT NULL,
      score INTEGER DEFAULT 0,
      window_start TIMESTAMP NOT NULL,
      window_end TIMESTAMP NOT NULL,
      computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(region, entity_type, entity_id, window_start)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_podcast_buzz_lookup ON podcast_buzz_cache(region, entity_type, score DESC)
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cached_podcasts (
      id SERIAL PRIMARY KEY,
      cache_key VARCHAR(100) NOT NULL UNIQUE,
      data JSONB NOT NULL,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('Database initialized with cache tables and podcast tables');
}

export default pool;
