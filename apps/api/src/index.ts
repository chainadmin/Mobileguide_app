import express from 'express';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'buzzreel-api' });
});

app.get('/api/trending', (_req, res) => {
  res.json({
    items: [
      { id: '1', title: 'The Example Show', mediaType: 'tv' },
      { id: '2', title: 'Demo Movie', mediaType: 'movie' }
    ]
  });
});

app.get('/api/buzz', (_req, res) => {
  res.json({
    topics: [
      { id: 'b1', headline: 'Award season chatter' },
      { id: 'b2', headline: 'Box office surprises' }
    ]
  });
});

app.get('/api/upcoming', (_req, res) => {
  res.json({
    items: [
      { id: '3', title: 'Next Big Release', releaseDate: '2025-01-15' },
      { id: '4', title: 'Indie Darling', releaseDate: '2025-03-01' }
    ]
  });
});

app.get('/api/title/:mediaType/:tmdbId', (req, res) => {
  const { mediaType, tmdbId } = req.params;

  res.json({
    id: tmdbId,
    mediaType,
    title: 'Sample Title',
    overview: 'A mock title detail response.',
    rating: 8.1
  });
});

app.get('/api/watchlist', (_req, res) => {
  res.json({
    items: [
      { id: 'wl1', title: 'My Saved Movie', mediaType: 'movie' }
    ]
  });
});

app.post('/api/watchlist/add', (req, res) => {
  res.json({
    status: 'added',
    item: req.body ?? null
  });
});

app.post('/api/watchlist/remove', (req, res) => {
  res.json({
    status: 'removed',
    item: req.body ?? null
  });
});

app.post('/api/events', (req, res) => {
  res.json({
    status: 'received',
    event: req.body ?? null
  });
});

app.post('/api/admin/refresh', (_req, res) => {
  res.json({
    status: 'refresh queued'
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`buzzreel-api listening on port ${port}`);
});
