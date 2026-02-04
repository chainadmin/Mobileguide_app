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

app.get('/setup-db', async (_req, res) => {
  try {
    await initDb();
    res.json({ status: 'ok', message: 'Database tables created successfully' });
  } catch (error) {
    console.error('Error setting up database:', error);
    res.status(500).json({ error: 'Failed to setup database', details: String(error) });
  }
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

app.get('/api/watchlist/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params;
    const result = await query(
      'SELECT tmdb_id, media_type, title, poster_path, added_at FROM watchlists WHERE guest_id = $1 ORDER BY added_at DESC',
      [guestId]
    );
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error getting watchlist:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
});

app.post('/api/watchlist/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params;
    const { tmdbId, mediaType, title, posterPath } = req.body;
    
    const countResult = await query(
      'SELECT COUNT(*) as count FROM watchlists WHERE guest_id = $1',
      [guestId]
    );
    const count = parseInt(countResult.rows[0].count, 10);
    
    if (count >= 10) {
      return res.status(403).json({ error: 'Watchlist limit reached', limitReached: true });
    }
    
    await query(
      `INSERT INTO watchlists (guest_id, tmdb_id, media_type, title, poster_path)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (guest_id, tmdb_id, media_type) DO NOTHING`,
      [guestId, tmdbId, mediaType, title, posterPath]
    );
    
    const result = await query(
      'SELECT tmdb_id, media_type, title, poster_path, added_at FROM watchlists WHERE guest_id = $1 ORDER BY added_at DESC',
      [guestId]
    );
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

app.delete('/api/watchlist/:guestId/:mediaType/:tmdbId', async (req, res) => {
  try {
    const { guestId, mediaType, tmdbId } = req.params;
    await query(
      'DELETE FROM watchlists WHERE guest_id = $1 AND media_type = $2 AND tmdb_id = $3',
      [guestId, mediaType, tmdbId]
    );
    
    const result = await query(
      'SELECT tmdb_id, media_type, title, poster_path, added_at FROM watchlists WHERE guest_id = $1 ORDER BY added_at DESC',
      [guestId]
    );
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

app.get('/privacy', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy - Buzzreel</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #0c0d12; color: #f5f5f5; line-height: 1.6; }
        h1 { color: #ff7a51; }
        h2 { color: #ff7a51; margin-top: 32px; }
        p, li { color: #9ea4b5; }
        a { color: #ff7a51; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> February 2026</p>
      
      <h2>Information We Collect</h2>
      <p>Buzzreel collects minimal data to provide you with a personalized entertainment discovery experience:</p>
      <ul>
        <li><strong>Anonymous Guest ID:</strong> A randomly generated identifier stored on your device to sync your watchlist across sessions.</li>
        <li><strong>Region Selection:</strong> Your chosen region to show relevant streaming availability and trending content.</li>
        <li><strong>Watchlist Data:</strong> Titles you save to your watchlist, stored on our servers linked to your guest ID.</li>
        <li><strong>View Activity:</strong> Anonymous aggregate counts of title views by region to power our "buzz" feature.</li>
        <li><strong>App Preferences:</strong> Platform filter selections and alert settings stored locally on your device.</li>
      </ul>
      
      <h2>How We Use Your Data</h2>
      <ul>
        <li>To display your saved watchlist across app sessions</li>
        <li>To show trending content in your region</li>
        <li>To filter content by your selected streaming platforms</li>
        <li>To improve our content recommendations</li>
      </ul>
      
      <h2>Data Sharing</h2>
      <p>We do not sell your personal data. We use The Movie Database (TMDB) API to fetch movie and TV information. Your data is not shared with third parties except as required by law.</p>
      
      <h2>Data Retention</h2>
      <p>Your watchlist data is retained as long as you use the app. Anonymous view counts are retained indefinitely for analytics.</p>
      
      <h2>Your Rights</h2>
      <p>You can clear your watchlist at any time within the app. Uninstalling the app removes your local guest ID and preferences.</p>
      
      <h2>Contact</h2>
      <p>For privacy questions, contact us at privacy@buzzreel.app</p>
    </body>
    </html>
  `);
});

app.get('/terms', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terms of Service - Buzzreel</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #0c0d12; color: #f5f5f5; line-height: 1.6; }
        h1 { color: #ff7a51; }
        h2 { color: #ff7a51; margin-top: 32px; }
        p, li { color: #9ea4b5; }
        a { color: #ff7a51; }
      </style>
    </head>
    <body>
      <h1>Terms of Service</h1>
      <p><strong>Last updated:</strong> February 2026</p>
      
      <h2>Acceptance of Terms</h2>
      <p>By using Buzzreel, you agree to these Terms of Service. If you do not agree, please do not use the app.</p>
      
      <h2>Description of Service</h2>
      <p>Buzzreel is an entertainment discovery app that helps you find trending movies and TV shows, track upcoming releases, and manage a personal watchlist. Content data is provided by The Movie Database (TMDB).</p>
      
      <h2>Use of Data</h2>
      <p>By using Buzzreel, you consent to the collection and use of data as described in our Privacy Policy. This includes:</p>
      <ul>
        <li>Anonymous usage data to improve our services and show regional trends</li>
        <li>Watchlist data synced to our servers for cross-session access</li>
        <li>Preference data stored locally on your device</li>
      </ul>
      <p>We use this data to provide personalized recommendations, regional trending content, and to improve the overall user experience.</p>
      
      <h2>Subscriptions</h2>
      <p>Buzzreel offers optional Pro subscriptions with additional features. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. You can manage subscriptions through your device's app store settings.</p>
      
      <h2>Content Attribution</h2>
      <p>Movie and TV data is provided by TMDB. Streaming provider information is courtesy of JustWatch via TMDB. Buzzreel is not endorsed or certified by TMDB.</p>
      
      <h2>User Conduct</h2>
      <p>You agree not to misuse the service, attempt to access it through unauthorized means, or use it for any unlawful purpose.</p>
      
      <h2>Disclaimer</h2>
      <p>Buzzreel is provided "as is" without warranties of any kind. We do not guarantee the accuracy of content information, streaming availability, or release dates.</p>
      
      <h2>Limitation of Liability</h2>
      <p>Buzzreel shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
      
      <h2>Changes to Terms</h2>
      <p>We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.</p>
      
      <h2>Contact</h2>
      <p>For questions about these terms, contact us at legal@buzzreel.app</p>
    </body>
    </html>
  `);
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
