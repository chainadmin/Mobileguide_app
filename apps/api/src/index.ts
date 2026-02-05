import express from 'express';
import cors from 'cors';
import { query, initDb } from './db';
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getTitleDetails,
  getWatchProviders,
  getUpcoming,
  searchMulti,
  TmdbTitle
} from './tmdb';
import {
  getTrendingPodcasts,
  getRecentEpisodes,
  getPodcastById,
  getEpisodeById,
  getEpisodesByShowId,
  validatePodcastApiKeys,
  PodcastShow,
  PodcastEpisode
} from './podcast';

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
    const { tmdbId, mediaType, title, posterPath, isPro } = req.body;
    
    if (!tmdbId || !mediaType || !title) {
      return res.status(400).json({ error: 'Missing required fields: tmdbId, mediaType, title' });
    }
    
    if (typeof tmdbId !== 'number' || !['movie', 'tv'].includes(mediaType)) {
      return res.status(400).json({ error: 'Invalid field types: tmdbId must be number, mediaType must be movie or tv' });
    }
    
    const countResult = await query(
      'SELECT COUNT(*) as count FROM watchlists WHERE guest_id = $1',
      [guestId]
    );
    const count = parseInt(countResult.rows[0].count, 10);
    
    if (!isPro && count >= 10) {
      return res.status(403).json({ error: 'Watchlist limit reached', limitReached: true });
    }
    
    await query(
      `INSERT INTO watchlists (guest_id, tmdb_id, media_type, title, poster_path)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (guest_id, tmdb_id, media_type) DO NOTHING`,
      [guestId, tmdbId, mediaType, title, posterPath || null]
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

const CACHE_HOURS = {
  trending: 6,
  title: 24,
  providers: 12,
  upcoming: 6
};

function isCacheValid(cachedAt: Date, hours: number): boolean {
  const now = new Date();
  const diff = (now.getTime() - new Date(cachedAt).getTime()) / (1000 * 60 * 60);
  return diff < hours;
}

app.get('/api/cache/trending/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const mediaType = (req.query.mediaType as string) || 'all';
    const timeWindow = (req.query.timeWindow as string) || 'day';
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_trending WHERE region = $1 AND media_type = $2 AND time_window = $3',
      [region, mediaType, timeWindow]
    );
    
    if (cached.rows[0] && isCacheValid(cached.rows[0].cached_at, CACHE_HOURS.trending)) {
      return res.json({ data: cached.rows[0].data, cached: true });
    }
    
    let data;
    if (mediaType === 'all') {
      const [movies, tv] = await Promise.all([
        getPopularMovies(region),
        getPopularTV(region)
      ]);
      data = { movies, tv };
    } else {
      data = await getTrending(mediaType as 'movie' | 'tv', timeWindow as 'day' | 'week');
    }
    
    await query(
      `INSERT INTO cached_trending (region, media_type, time_window, data, cached_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (region, media_type, time_window)
       DO UPDATE SET data = $4, cached_at = NOW()`,
      [region, mediaType, timeWindow, data]
    );
    
    res.json({ data, cached: false });
  } catch (error) {
    console.error('Error getting cached trending:', error);
    res.status(500).json({ error: 'Failed to get trending content' });
  }
});

app.get('/api/cache/title/:mediaType/:tmdbId', async (req, res) => {
  try {
    const { mediaType, tmdbId } = req.params;
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_titles WHERE tmdb_id = $1 AND media_type = $2',
      [tmdbId, mediaType]
    );
    
    if (cached.rows[0] && isCacheValid(cached.rows[0].cached_at, CACHE_HOURS.title)) {
      return res.json({ data: cached.rows[0].data, cached: true });
    }
    
    const data = await getTitleDetails(mediaType as 'movie' | 'tv', Number(tmdbId));
    
    await query(
      `INSERT INTO cached_titles (tmdb_id, media_type, data, cached_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (tmdb_id, media_type)
       DO UPDATE SET data = $3, cached_at = NOW()`,
      [tmdbId, mediaType, data]
    );
    
    res.json({ data, cached: false });
  } catch (error) {
    console.error('Error getting cached title:', error);
    res.status(500).json({ error: 'Failed to get title details' });
  }
});

app.get('/api/cache/providers/:mediaType/:tmdbId/:region', async (req, res) => {
  try {
    const { mediaType, tmdbId, region } = req.params;
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_providers WHERE tmdb_id = $1 AND media_type = $2 AND region = $3',
      [tmdbId, mediaType, region]
    );
    
    if (cached.rows[0] && isCacheValid(cached.rows[0].cached_at, CACHE_HOURS.providers)) {
      return res.json({ data: cached.rows[0].data, cached: true });
    }
    
    const data = await getWatchProviders(mediaType as 'movie' | 'tv', Number(tmdbId), region);
    
    await query(
      `INSERT INTO cached_providers (tmdb_id, media_type, region, data, cached_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (tmdb_id, media_type, region)
       DO UPDATE SET data = $4, cached_at = NOW()`,
      [tmdbId, mediaType, region, data]
    );
    
    res.json({ data, cached: false });
  } catch (error) {
    console.error('Error getting cached providers:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
});

app.get('/api/cache/upcoming/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_trending WHERE region = $1 AND media_type = $2 AND time_window = $3',
      [region, 'upcoming', 'week']
    );
    
    if (cached.rows[0] && isCacheValid(cached.rows[0].cached_at, CACHE_HOURS.upcoming)) {
      return res.json({ data: cached.rows[0].data, cached: true });
    }
    
    const data = await getUpcoming(region);
    
    await query(
      `INSERT INTO cached_trending (region, media_type, time_window, data, cached_at)
       VALUES ($1, 'upcoming', 'week', $2, NOW())
       ON CONFLICT (region, media_type, time_window)
       DO UPDATE SET data = $2, cached_at = NOW()`,
      [region, data]
    );
    
    res.json({ data, cached: false });
  } catch (error) {
    console.error('Error getting cached upcoming:', error);
    res.status(500).json({ error: 'Failed to get upcoming content' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    const region = (req.query.region as string) || 'US';
    const isPro = req.query.isPro === 'true';
    
    if (!q || q.length < 2) {
      return res.json({ buzzing: [], upcoming: [], fallback: [] });
    }
    
    const [trendingCache, upcomingCache, buzzResult] = await Promise.all([
      query(
        'SELECT data FROM cached_trending WHERE region = $1 AND media_type = $2 AND time_window = $3',
        [region, 'all', 'day']
      ),
      query(
        'SELECT data FROM cached_trending WHERE region = $1 AND media_type = $2 AND time_window = $3',
        [region, 'upcoming', 'week']
      ),
      query(
        'SELECT media_type, tmdb_id, view_count FROM buzz_views WHERE region = $1 ORDER BY view_count DESC LIMIT 50',
        [region]
      )
    ]);
    
    const buzzMap = new Map<string, number>();
    for (const row of buzzResult.rows) {
      buzzMap.set(`${row.media_type}-${row.tmdb_id}`, row.view_count);
    }
    
    let trendingTitles: TmdbTitle[] = [];
    if (trendingCache.rows[0]?.data) {
      const tData = trendingCache.rows[0].data;
      if (tData.movies) trendingTitles.push(...tData.movies);
      if (tData.tv) trendingTitles.push(...tData.tv);
    }
    
    let upcomingTitles: TmdbTitle[] = [];
    if (upcomingCache.rows[0]?.data) {
      upcomingTitles = upcomingCache.rows[0].data;
    }
    
    const matchTitle = (item: TmdbTitle) => {
      const title = (item.title || item.name || '').toLowerCase();
      return title.includes(q);
    };
    
    const buzzingMatches = trendingTitles
      .filter(matchTitle)
      .map(item => {
        const key = `${item.media_type}-${item.id}`;
        return { ...item, isBuzzing: true, buzzScore: buzzMap.get(key) || 0 };
      })
      .sort((a, b) => b.buzzScore - a.buzzScore)
      .slice(0, 10);
    
    const upcomingMatches = upcomingTitles
      .filter(matchTitle)
      .slice(0, 5);
    
    let fallbackResults: any[] = [];
    const buzzingIds = new Set(buzzingMatches.map(b => `${b.media_type}-${b.id}`));
    const upcomingIds = new Set(upcomingMatches.map(u => `${u.media_type}-${u.id}`));
    
    const tmdbResults = await searchMulti(q);
    const limit = isPro ? 20 : 5;
    fallbackResults = tmdbResults
      .filter(item => {
        const key = `${item.media_type}-${item.id}`;
        return !buzzingIds.has(key) && !upcomingIds.has(key);
      })
      .slice(0, limit)
      .map(item => ({ ...item, isBuzzing: false, buzzScore: 0 }));
    
    res.json({
      buzzing: buzzingMatches,
      upcoming: upcomingMatches,
      fallback: fallbackResults
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed', buzzing: [], upcoming: [], fallback: [] });
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

const PODCAST_CACHE_HOURS = 6;

function isPodcastCacheValid(cachedAt: Date): boolean {
  const now = new Date();
  const diff = (now.getTime() - new Date(cachedAt).getTime()) / (1000 * 60 * 60);
  return diff < PODCAST_CACHE_HOURS;
}

app.get('/api/podcasts/buzz/show/:showId', async (req, res) => {
  try {
    const { showId } = req.params;
    const region = (req.query.region as string) || 'US';
    
    const result = await query(
      `SELECT COUNT(*) as view_count FROM podcast_events 
       WHERE show_id = $1 AND region = $2 AND event_type = 'show_view'
       AND created_at >= NOW() - INTERVAL '24 hours'`,
      [showId, region]
    );
    const viewCount = parseInt(result.rows[0]?.view_count ?? 0, 10);
    res.json({ showId: Number(showId), region, viewCount });
  } catch (error) {
    console.error('Error getting podcast buzz:', error);
    res.status(500).json({ error: 'Failed to get podcast buzz', viewCount: 0 });
  }
});

app.post('/api/podcasts/buzz/show/:showId/view', async (req, res) => {
  try {
    const { showId } = req.params;
    const { region, guestId } = req.body;
    
    if (!region) {
      return res.status(400).json({ error: 'Missing region' });
    }
    
    await query(
      `INSERT INTO podcast_events (guest_id, region, event_type, show_id)
       VALUES ($1, $2, 'show_view', $3)`,
      [guestId || null, region, showId]
    );
    
    const result = await query(
      `SELECT COUNT(*) as view_count FROM podcast_events 
       WHERE show_id = $1 AND region = $2 AND event_type = 'show_view'
       AND created_at >= NOW() - INTERVAL '24 hours'`,
      [showId, region]
    );
    const viewCount = parseInt(result.rows[0]?.view_count ?? 0, 10);
    res.json({ showId: Number(showId), region, viewCount });
  } catch (error) {
    console.error('Error recording podcast view:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

app.get('/api/podcasts/buzz', async (req, res) => {
  try {
    const region = (req.query.region as string) || 'US';
    const cacheKey = `buzz_${region}`;
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_podcasts WHERE cache_key = $1',
      [cacheKey]
    );
    
    if (cached.rows[0] && isPodcastCacheValid(cached.rows[0].cached_at)) {
      const data = typeof cached.rows[0].data === 'string' 
        ? JSON.parse(cached.rows[0].data) 
        : cached.rows[0].data;
      return res.json(data);
    }
    
    await computePodcastBuzz(region);
    
    const buzzResult = await query(
      `SELECT entity_id, score FROM podcast_buzz_cache
       WHERE region = $1 AND entity_type = 'show'
       ORDER BY score DESC LIMIT 20`,
      [region]
    );
    
    let shows: any[] = [];
    
    if (buzzResult.rows.length > 0) {
      const showIds = buzzResult.rows.map(r => r.entity_id);
      const showResult = await query(
        `SELECT id, title, author, image, description, language, episode_count
         FROM podcast_shows WHERE id = ANY($1)`,
        [showIds]
      );
      
      const showMap = new Map(showResult.rows.map(s => [s.id, s]));
      const buzzMap = new Map(buzzResult.rows.map(r => [r.entity_id, r.score]));
      
      for (const showId of showIds) {
        const show = showMap.get(showId);
        if (show) {
          shows.push({
            id: show.id,
            title: show.title,
            author: show.author,
            image: show.image,
            description: show.description || '',
            language: show.language || 'en',
            episodeCount: show.episode_count || 0,
            buzzScore: buzzMap.get(showId) || 0
          });
        }
      }
    }
    
    if (shows.length < 5) {
      const trending = await getTrendingPodcasts(20, 'en');
      shows = trending;
    }
    
    const responseData = { shows, region };
    
    await query(
      `INSERT INTO cached_podcasts (cache_key, data, cached_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (cache_key)
       DO UPDATE SET data = $2, cached_at = NOW()`,
      [cacheKey, responseData]
    );
    
    res.json(responseData);
  } catch (error) {
    console.error('Error getting podcast buzz:', error);
    res.status(500).json({ error: 'Failed to get podcast buzz', shows: [] });
  }
});

app.get('/api/podcasts/new', async (req, res) => {
  try {
    const region = (req.query.region as string) || 'US';
    const cacheKey = `new_${region}`;
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_podcasts WHERE cache_key = $1',
      [cacheKey]
    );
    
    if (cached.rows[0] && isPodcastCacheValid(cached.rows[0].cached_at)) {
      const data = typeof cached.rows[0].data === 'string' 
        ? JSON.parse(cached.rows[0].data) 
        : cached.rows[0].data;
      return res.json(data);
    }
    
    const episodes = await getRecentEpisodes(20, 'en');
    const responseData = { episodes, region };
    
    await query(
      `INSERT INTO cached_podcasts (cache_key, data, cached_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (cache_key)
       DO UPDATE SET data = $2, cached_at = NOW()`,
      [cacheKey, responseData]
    );
    
    res.json(responseData);
  } catch (error) {
    console.error('Error getting new podcast episodes:', error);
    res.status(500).json({ error: 'Failed to get new episodes', episodes: [] });
  }
});

app.get('/api/podcasts/top', async (req, res) => {
  try {
    const region = (req.query.region as string) || 'US';
    const cacheKey = `top_${region}`;
    
    const cached = await query(
      'SELECT data, cached_at FROM cached_podcasts WHERE cache_key = $1',
      [cacheKey]
    );
    
    if (cached.rows[0] && isPodcastCacheValid(cached.rows[0].cached_at)) {
      const data = typeof cached.rows[0].data === 'string' 
        ? JSON.parse(cached.rows[0].data) 
        : cached.rows[0].data;
      return res.json(data);
    }
    
    const shows = await getTrendingPodcasts(20, 'en');
    const responseData = { shows, region };
    
    await query(
      `INSERT INTO cached_podcasts (cache_key, data, cached_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (cache_key)
       DO UPDATE SET data = $2, cached_at = NOW()`,
      [cacheKey, responseData]
    );
    
    res.json(responseData);
  } catch (error) {
    console.error('Error getting top podcasts:', error);
    res.status(500).json({ error: 'Failed to get top podcasts', shows: [] });
  }
});

app.get('/api/podcasts/show/:id', async (req, res) => {
  try {
    const showId = parseInt(req.params.id, 10);
    const guestId = req.query.guestId as string;
    
    const show = await getPodcastById(showId);
    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }
    
    let isFollowing = false;
    if (guestId) {
      const followResult = await query(
        'SELECT 1 FROM podcast_follows WHERE guest_id = $1 AND show_id = $2',
        [guestId, showId]
      );
      isFollowing = followResult.rows.length > 0;
    }
    
    res.json({ show, isFollowing });
  } catch (error) {
    console.error('Error getting podcast show:', error);
    res.status(500).json({ error: 'Failed to get show details' });
  }
});

app.get('/api/podcasts/show/:id/episodes', async (req, res) => {
  try {
    const showId = parseInt(req.params.id, 10);
    const episodes = await getEpisodesByShowId(showId, 50);
    res.json({ episodes });
  } catch (error) {
    console.error('Error getting show episodes:', error);
    res.status(500).json({ error: 'Failed to get episodes', episodes: [] });
  }
});

app.get('/api/podcasts/episode/:id', async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id, 10);
    const episode = await getEpisodeById(episodeId);
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    res.json({ episode });
  } catch (error) {
    console.error('Error getting podcast episode:', error);
    res.status(500).json({ error: 'Failed to get episode details' });
  }
});

app.post('/api/podcasts/events', async (req, res) => {
  try {
    const { guestId, region, eventType, showId, episodeId } = req.body;
    
    if (!region || !eventType) {
      return res.status(400).json({ error: 'Missing required fields: region, eventType' });
    }
    
    await query(
      `INSERT INTO podcast_events (guest_id, region, event_type, show_id, episode_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [guestId || null, region, eventType, showId || null, episodeId || null]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording podcast event:', error);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

app.get('/api/podcasts/follows', async (req, res) => {
  try {
    const guestId = req.query.guestId as string;
    
    if (!guestId) {
      return res.status(400).json({ error: 'Missing guestId' });
    }
    
    const result = await query(
      `SELECT pf.show_id, pf.region, pf.added_at, ps.title, ps.author, ps.image
       FROM podcast_follows pf
       LEFT JOIN podcast_shows ps ON pf.show_id = ps.id
       WHERE pf.guest_id = $1
       ORDER BY pf.added_at DESC`,
      [guestId]
    );
    
    res.json({ follows: result.rows });
  } catch (error) {
    console.error('Error getting podcast follows:', error);
    res.status(500).json({ error: 'Failed to get follows', follows: [] });
  }
});

app.post('/api/podcasts/follows/add', async (req, res) => {
  try {
    const { guestId, showId, region, isPro } = req.body;
    
    if (!guestId || !showId || !region) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const countResult = await query(
      'SELECT COUNT(*) as count FROM podcast_follows WHERE guest_id = $1',
      [guestId]
    );
    const count = parseInt(countResult.rows[0].count, 10);
    
    if (!isPro && count >= 10) {
      return res.status(403).json({ error: 'Follow limit reached', limitReached: true });
    }
    
    const show = await getPodcastById(showId);
    if (show) {
      await query(
        `INSERT INTO podcast_shows (id, title, description, image, language, author, episode_count, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           image = EXCLUDED.image,
           author = EXCLUDED.author,
           episode_count = EXCLUDED.episode_count,
           updated_at = NOW()`,
        [show.id, show.title, show.description, show.image, show.language, show.author, show.episodeCount]
      );
    }
    
    await query(
      `INSERT INTO podcast_follows (guest_id, show_id, region)
       VALUES ($1, $2, $3)
       ON CONFLICT (guest_id, show_id) DO NOTHING`,
      [guestId, showId, region]
    );
    
    await query(
      `INSERT INTO podcast_events (guest_id, region, event_type, show_id)
       VALUES ($1, $2, 'show_follow', $3)`,
      [guestId, region, showId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error following podcast:', error);
    res.status(500).json({ error: 'Failed to follow show' });
  }
});

app.post('/api/podcasts/follows/remove', async (req, res) => {
  try {
    const { guestId, showId } = req.body;
    
    if (!guestId || !showId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await query(
      'DELETE FROM podcast_follows WHERE guest_id = $1 AND show_id = $2',
      [guestId, showId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing podcast:', error);
    res.status(500).json({ error: 'Failed to unfollow show' });
  }
});

async function computePodcastBuzz(region: string) {
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);
  const recentCutoff = new Date(windowEnd.getTime() - 6 * 60 * 60 * 1000);

  const result = await query(
    `SELECT 
       COALESCE(show_id, 0) as entity_id,
       event_type,
       created_at
     FROM podcast_events
     WHERE region = $1 AND created_at >= $2`,
    [region, windowStart]
  );

  const scores = new Map<number, number>();
  
  for (const row of result.rows) {
    const entityId = row.entity_id;
    if (!entityId) continue;
    
    let weight = 1;
    if (row.event_type === 'episode_view') weight = 1;
    else if (row.event_type === 'episode_save') weight = 3;
    else if (row.event_type === 'show_follow') weight = 4;
    
    const decay = new Date(row.created_at) >= recentCutoff ? 1.0 : 0.5;
    const score = weight * decay;
    
    scores.set(entityId, (scores.get(entityId) || 0) + score);
  }

  for (const [entityId, score] of scores) {
    await query(
      `INSERT INTO podcast_buzz_cache (region, entity_type, entity_id, score, window_start, window_end, computed_at)
       VALUES ($1, 'show', $2, $3, $4, $5, NOW())
       ON CONFLICT (region, entity_type, entity_id, window_start)
       DO UPDATE SET score = $3, computed_at = NOW()`,
      [region, entityId, Math.round(score), windowStart, windowEnd]
    );
  }

  return scores.size;
}

async function start() {
  const tmdbKey = process.env.TMDB_API_KEY;
  if (!tmdbKey) {
    console.error('FATAL: TMDB_API_KEY is not set. Server cannot start.');
    process.exit(1);
  }
  
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`buzzreel-api listening on port ${port}`);
      console.log('TMDB API key: configured');
      console.log('Podcast Index API:', process.env.PODCASTINDEX_API_KEY ? 'configured' : 'not configured');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
