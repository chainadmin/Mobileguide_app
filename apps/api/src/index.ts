import express from 'express';
import cors from 'cors';
import { query, initDb } from './db';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'buzzreel-api' });
});

app.get('/api/buzz/:region/:mediaType/:tmdbId', async (req, res) => {
  try {
    const { region, mediaType, tmdbId } = req.params;
    const result = await query(
      'SELECT view_count FROM buzz_views WHERE region = $1 AND media_type = $2 AND tmdb_id = $3',
      [region, mediaType, tmdbId]
    );
    const viewCount = result.rows[0]?.view_count ?? 0;
    res.json({ region, mediaType, tmdbId: Number(tmdbId), viewCount });
  } catch (error) {
    console.error('Error getting buzz:', error);
    res.status(500).json({ error: 'Failed to get buzz count' });
  }
});

app.post('/api/buzz/:region/:mediaType/:tmdbId/view', async (req, res) => {
  try {
    const { region, mediaType, tmdbId } = req.params;
    await query(
      `INSERT INTO buzz_views (region, media_type, tmdb_id, view_count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (region, media_type, tmdb_id)
       DO UPDATE SET view_count = buzz_views.view_count + 1, updated_at = CURRENT_TIMESTAMP`,
      [region, mediaType, tmdbId]
    );
    const result = await query(
      'SELECT view_count FROM buzz_views WHERE region = $1 AND media_type = $2 AND tmdb_id = $3',
      [region, mediaType, tmdbId]
    );
    const viewCount = result.rows[0]?.view_count ?? 1;
    res.json({ region, mediaType, tmdbId: Number(tmdbId), viewCount });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

app.get('/api/buzz/:region/top', async (req, res) => {
  try {
    const { region } = req.params;
    const result = await query(
      'SELECT media_type, tmdb_id, view_count FROM buzz_views WHERE region = $1 ORDER BY view_count DESC LIMIT 20',
      [region]
    );
    res.json({ region, items: result.rows });
  } catch (error) {
    console.error('Error getting top buzz:', error);
    res.status(500).json({ error: 'Failed to get top buzz' });
  }
});

async function start() {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`buzzreel-api listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
