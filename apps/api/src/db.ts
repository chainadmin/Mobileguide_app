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
  
  console.log('Database initialized with cache tables');
}

export default pool;
