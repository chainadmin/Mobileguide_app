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

app.get('/api/buzz/:mediaType/:tmdbId', async (req, res) => {
  try {
    const { mediaType, tmdbId } = req.params;
    const result = await query(
      'SELECT vote_count FROM buzz_votes WHERE media_type = $1 AND tmdb_id = $2',
      [mediaType, tmdbId]
    );
    const voteCount = result.rows[0]?.vote_count ?? 0;
    res.json({ mediaType, tmdbId: Number(tmdbId), voteCount });
  } catch (error) {
    console.error('Error getting buzz:', error);
    res.status(500).json({ error: 'Failed to get buzz count' });
  }
});

app.post('/api/buzz/:mediaType/:tmdbId/vote', async (req, res) => {
  try {
    const { mediaType, tmdbId } = req.params;
    await query(
      `INSERT INTO buzz_votes (media_type, tmdb_id, vote_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (media_type, tmdb_id)
       DO UPDATE SET vote_count = buzz_votes.vote_count + 1, updated_at = CURRENT_TIMESTAMP`,
      [mediaType, tmdbId]
    );
    const result = await query(
      'SELECT vote_count FROM buzz_votes WHERE media_type = $1 AND tmdb_id = $2',
      [mediaType, tmdbId]
    );
    const voteCount = result.rows[0]?.vote_count ?? 1;
    res.json({ mediaType, tmdbId: Number(tmdbId), voteCount });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.get('/api/buzz/top', async (_req, res) => {
  try {
    const result = await query(
      'SELECT media_type, tmdb_id, vote_count FROM buzz_votes ORDER BY vote_count DESC LIMIT 20'
    );
    res.json({ items: result.rows });
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
