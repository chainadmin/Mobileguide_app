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
    CREATE TABLE IF NOT EXISTS buzz_votes (
      id SERIAL PRIMARY KEY,
      media_type VARCHAR(10) NOT NULL,
      tmdb_id INTEGER NOT NULL,
      vote_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(media_type, tmdb_id)
    )
  `);
  console.log('Database initialized');
}

export default pool;
