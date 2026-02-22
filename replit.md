# Buzzreel Monorepo

## Overview

Buzzreel is a mobile-first entertainment discovery platform that helps users find trending movies and TV shows, track upcoming releases, and manage personal watchlists. The project is structured as a monorepo containing an Expo React Native mobile app and a Node.js/Express API backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses npm workspaces to manage three applications under `apps/`:
- `apps/mobile` - Expo React Native app (TypeScript)
- `apps/api` - Express REST API (TypeScript)
- `apps/web` - Landing page website for buzzreel.app (static HTML/CSS served by Express)

This approach keeps frontend and backend code in a single repository while maintaining separate dependency management.

### Website (apps/web)
- **Purpose**: Landing page and legal pages for buzzreel.app custom domain
- **Stack**: Static HTML/CSS served by Express.js
- **Design**: Dark "neon magazine" theme matching the mobile app
- **Pages**: Landing page (/), Privacy Policy (/privacy), Terms of Service (/terms)
- **Deployment**: Replit static deployment with custom domain buzzreel.app
- **Port**: 5000 (development)

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81 and React 19.1
- **Navigation**: React Navigation v6 with a hybrid pattern:
  - Native stack navigator for modal/full-screen flows (Splash, RegionSelect, TitleDetail, PodcastShowDetail, PodcastEpisodeDetail, Paywall, Settings)
  - Bottom tab navigator for main content tabs (Trending, Upcoming, Podcasts, Watchlist)
- **Component Structure**: Reusable UI components in `src/components/` (PosterCard, BuzzMeter, ProviderChips, etc.)
- **Styling**: React Native StyleSheet with centralized dark "neon magazine" theme
  - Theme file: `src/theme.ts` with colors, spacing, and borderRadius constants
  - Primary background: #0c0d12, Accent: #ff7a51 (coral orange)
  - All components use theme constants for consistency
- **Platform Support**: iOS, Android, and Web (via react-native-web)
- **Region Context**: Global state for selected region using React Context + AsyncStorage

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development**: tsx for hot-reloading during development
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Current Endpoints**:
  - `GET /health` - Service health check
  - `GET /api/buzz/:region/:mediaType/:tmdbId` - Get view count for a title in a region
  - `POST /api/buzz/:region/:mediaType/:tmdbId/view` - Record a view for a title in a region
  - `GET /api/buzz/:region/top` - Get top viewed titles in a region
  - `GET /api/watchlist/:guestId` - Get user's watchlist
  - `POST /api/watchlist/:guestId` - Add item to watchlist (10-item limit for free, unlimited for Pro)
  - `DELETE /api/watchlist/:guestId/:mediaType/:tmdbId` - Remove item from watchlist
  - `GET /api/cache/trending/:region` - Get cached trending content (6hr cache)
  - `GET /api/cache/title/:mediaType/:tmdbId` - Get cached title details (24hr cache)
  - `GET /api/cache/providers/:mediaType/:tmdbId/:region` - Get cached providers (12hr cache)
  - `GET /api/cache/upcoming/:region` - Get cached upcoming releases (6hr cache)
  - `GET /api/search?q=&region=&isPro=` - Search titles (buzzing first, then TMDB fallback; Pro gets unlimited fallback)
  - `GET /api/podcasts/buzz?region=` - Get buzzing podcasts (6hr cache)
  - `GET /api/podcasts/new?region=` - Get recent podcast episodes (6hr cache)
  - `GET /api/podcasts/top?region=` - Get top podcasts in region (6hr cache)
  - `GET /api/podcasts/show/:id` - Get podcast show details
  - `GET /api/podcasts/show/:id/episodes` - Get episodes for a show
  - `GET /api/podcasts/episode/:id` - Get episode details
  - `POST /api/podcasts/events` - Record podcast engagement events
  - `GET /api/podcasts/follows?guestId=` - Get followed podcasts
  - `POST /api/podcasts/follows/add` - Follow a podcast (10-item limit for free)
  - `POST /api/podcasts/follows/remove` - Unfollow a podcast
- **Port**: Defaults to 4000, configurable via PORT environment variable
- **Deployment**: Railway (welcoming-elegance-production-9299.up.railway.app)

### Data Layer
- **Database**: PostgreSQL hosted on Railway
- **Migrations**: SQL files stored in `db/migrations/` directory
- **Buzz Views Table**: Stores anonymous regional engagement data
  - Tracks views per region, media_type, and tmdb_id
  - Unique constraint on (region, media_type, tmdb_id)
- **Watchlists Table**: Stores user watchlists keyed by guest_id
  - Columns: guest_id, tmdb_id, media_type, title, poster_path, added_at
  - Unique constraint on (guest_id, tmdb_id, media_type)
- **Cache Tables**: Server-side caching to reduce API calls
  - `cached_trending`: Trending content by region (6hr expiry)
  - `cached_titles`: Title details (24hr expiry)
  - `cached_providers`: Watch providers by region (12hr expiry)
  - `cached_podcasts`: Podcast data by region (6hr expiry)
- **Podcast Tables**: Podcast discovery and engagement tracking
  - `podcast_shows`: Show metadata from Podcast Index
  - `podcast_episodes`: Episode metadata with show reference
  - `podcast_follows`: User follows (guest_id, show_id) with 10-item free limit
  - `podcast_events`: Engagement events (episode_view, show_follow, episode_save)
  - `podcast_buzz_cache`: Computed buzz scores by region

## External Dependencies

### Mobile App
- **Expo**: Managed workflow for React Native development
- **React Navigation**: Navigation library for routing between screens
- **react-native-screens** & **react-native-safe-area-context**: Native navigation primitives
- **@react-native-async-storage/async-storage**: Persist user's region selection

### API
- **Express**: Web framework for REST API
- **pg**: PostgreSQL client for Node.js
- **tsx**: TypeScript execution and hot-reloading for development
- **cors**: Cross-origin resource sharing for API access

### External Integrations
- **TMDB (The Movie Database)**: Live integration with TMDB API for trending, upcoming, and title details
  - Uses EXPO_PUBLIC_TMDB_API_KEY environment variable (api_key query parameter)
  - Server validates TMDB_API_KEY at startup and fails fast if missing
  - Service file: `src/services/tmdb.ts`
  - Attribution displayed in Settings screen as required by TMDB terms
- **Streaming Provider Data**: Watch provider info fetched via TMDB API (JustWatch data), filtered by user's region
- **Podcast Index API**: Podcast discovery and metadata
  - Uses PODCASTINDEX_API_KEY and PODCASTINDEX_API_SECRET environment variables
  - Authentication via HMAC SHA-1 signature in request headers
  - Service file: `apps/api/src/podcast.ts`
  - Endpoints: trending podcasts, recent episodes, show/episode details

## Recent Changes
- **Feb 2026**: Upgraded Expo SDK from 50 to 54 for app store compatibility
  - Updated to React Native 0.76+ and React 19
  - Updated all Expo packages to SDK 54 compatible versions
  - Fixed navigation package compatibility (React Navigation v6)
  - Required --legacy-peer-deps flag for npm workspaces
- **Feb 2026**: Implemented watchlist backend persistence and engagement features
  - GuestId (UUID) generated and stored in AsyncStorage for anonymous users
  - Watchlist syncs with backend API per guestId (CRUD operations)
  - Free users capped at 10 items server-side; exceeding cap opens Paywall
  - Daily Digest enhanced: "Top 10 Today" with rank badges, "New This Week" for recent releases
  - Streak tracking: daily app opens tracked locally, displayed as "X days" badge on Trending
  - 24-hour caching for Daily Digest data
- **Feb 2026**: Implemented full Pro features
  - PlatformFiltersScreen for selecting streaming services (Netflix, Disney+, Max, etc.)
  - PlatformFiltersContext stores selections in AsyncStorage
  - AlertsContext for release alert toggles on watchlist items
  - Watchlist cards show bell icons for Pro users to enable/disable alerts per title
  - Privacy and Terms pages served from Railway API with full data disclosure
  - Settings links updated to use Railway URL for legal pages
- **Feb 2026**: Implemented Pro monetization with expo-iap (Play Billing v8.0+ / StoreKit 2)
  - Migrated from deprecated expo-in-app-purchases (AIDL) to expo-iap for Google Play compliance
  - expo-iap uses Play Billing Library v8.0 (exceeds Google's 6.0.1+ requirement)
  - Kotlin 2.2.0 configured via expo-build-properties for billing library compatibility
  - IAPService handles connection, purchases, restore, and subscription checks
  - Product IDs: buzzreel_pro_monthly ($1.99/mo), buzzreel_pro_yearly ($9.99/yr), buzzreel_pro_lifetime ($24.99 one-time)
  - EntitlementsContext with isPro, setDevPro (dev-only), restorePurchases, refreshProStatus
  - Purchase/error listeners via purchaseUpdatedListener and purchaseErrorListener
  - Dev toggle only works in __DEV__ mode, separate from production subscription status
  - PaywallScreen triggers real store purchases on Android and iOS
  - Web platform handled gracefully (purchases only available on mobile)
- **Feb 2026**: Added subscription paywall and enhanced UI features
  - PaywallScreen with Monthly ($1.99) and Yearly ($9.99) tiers
  - Daily Digest horizontal strip on Trending showing upcoming movies
  - Upcoming screen grouped by date with "Drops Today" callouts and 14-day filter
  - Watchlist shows Pro/Free plan distinction with upgrade prompts and limit banners
  - Settings includes subscription management, restore purchases, platform filters (Pro), and Credits section
  - Privacy/Terms links point to buzzreel.app (placeholder URLs)
- **Feb 2026**: Implemented regional buzz tracking system
  - Users select their region on first launch
  - Buzz counts track how many times a title was viewed in each region
  - TrendingScreen shows regional buzz overlay on content
  - TitleDetailScreen records a view when opened and displays regional view count
  - API deployed on Railway with PostgreSQL database
  - Watch providers filtered by user's selected region
- **Feb 2026**: Integrated TMDB API for real movie/TV data
  - TrendingScreen and UpcomingScreen fetch live data
  - TitleDetailScreen shows full details with streaming providers
  - PosterCard is tappable and navigates to detail view
  - Settings includes TMDB attribution
- **Feb 2026**: Added Podcasts tab with Podcast Index API integration
  - 4th bottom tab "Podcasts" with PodcastsScreen showing Buzzing Now, New Drops, Top in Region
  - PodcastShowDetailScreen with follow/unfollow, episode list
  - PodcastEpisodeDetailScreen with show link and external play button
  - Backend caching for podcast data (6hr expiry)
  - Buzz scoring system: episode_view=1, episode_save=3, show_follow=4 with 6hr decay
  - Pro limits: 10 podcast follows free, unlimited for Pro
- **Feb 2026**: Security hardening
  - Removed /setup-db endpoint (tables created via initDb on startup)
  - Fixed JSONB caching to store objects directly (no double-encoding)
  - Added input validation to watchlist endpoints (400 errors for bad input)
  - Server validates TMDB_API_KEY at startup and fails fast if missing
- **Feb 2026**: Podcast buzz tracking with real view data
  - GET /api/podcasts/buzz/show/:showId - Get view count for a podcast in a region
  - POST /api/podcasts/buzz/show/:showId/view - Record a view when opening a podcast
  - PodcastShowDetailScreen now uses BuzzMeter bar component with real view counts
  - View is recorded when user opens a podcast show (tracked by region)
  - WatchlistScreen displays followed podcasts with BuzzMeter showing regional views
  - Fixed podcast loading in Watchlist (waits for guestId before fetching)
  - Hidden scrollbar on PodcastShowDetailScreen for cleaner UI
- **Feb 2026**: Removed Google AdMob banner ads
  - react-native-google-mobile-ads v16 incompatible with Expo SDK 54 (build failures)
  - Removed AdBanner component, withAdIdPermission plugin, and all ad config
  - Enabled New Architecture (newArchEnabled: true) for future compatibility
- **Feb 2026**: Added Search feature with buzz-based ranking
  - Search icon (🔍) in Trending screen header opens SearchScreen
  - SearchScreen shows: Recent Searches, Suggested Now (🔥), Upcoming (📅)
  - Search prioritizes buzzing/trending results first, then TMDB fallback
  - Free users get 5 fallback results from TMDB, Pro gets unlimited
  - Results show "🔥 Buzzing" tag for trending items, "Not trending" for fallback
  - Backend GET /api/search endpoint searches cached trending + upcoming + TMDB
  - Recent searches stored locally in AsyncStorage
