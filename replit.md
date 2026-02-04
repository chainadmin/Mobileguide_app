# Buzzreel Monorepo

## Overview

Buzzreel is a mobile-first entertainment discovery platform that helps users find trending movies and TV shows, track upcoming releases, and manage personal watchlists. The project is structured as a monorepo containing an Expo React Native mobile app and a Node.js/Express API backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses npm workspaces to manage two applications under `apps/`:
- `apps/mobile` - Expo React Native app (TypeScript)
- `apps/api` - Express REST API (TypeScript)

This approach keeps frontend and backend code in a single repository while maintaining separate dependency management.

### Frontend Architecture
- **Framework**: Expo SDK 50 with React Native 0.73
- **Navigation**: React Navigation v6 with a hybrid pattern:
  - Native stack navigator for modal/full-screen flows (Splash, RegionSelect, TitleDetail, Paywall, Settings)
  - Bottom tab navigator for main content tabs (Trending, Upcoming, Watchlist)
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
- **Port**: Defaults to 4000, configurable via PORT environment variable
- **Deployment**: Railway (welcoming-elegance-production-9299.up.railway.app)

### Data Layer
- **Database**: PostgreSQL hosted on Railway
- **Migrations**: SQL files stored in `db/migrations/` directory
- **Buzz Views Table**: Stores anonymous regional engagement data
  - Tracks views per region, media_type, and tmdb_id
  - Unique constraint on (region, media_type, tmdb_id)

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
  - Service file: `src/services/tmdb.ts`
  - Attribution displayed in Settings screen as required by TMDB terms
- **Streaming Provider Data**: Watch provider info fetched via TMDB API (JustWatch data), filtered by user's region

## Recent Changes
- **Feb 2026**: Added subscription paywall and enhanced UI features
  - PaywallScreen with Monthly ($1.99), Yearly ($9.99), and Lifetime ($19.99) tiers
  - Daily Digest horizontal strip on Trending showing upcoming movies
  - Upcoming screen grouped by date with "Drops Today" callouts and 14-day filter
  - Watchlist shows Pro/Free plan distinction with upgrade prompts and limit banners
  - Settings includes subscription management, restore purchases, platform filters (Pro), and Credits section
  - Privacy/Terms links point to buzzreel.app (placeholder URLs)
  - Note: isPro is hardcoded to false pending subscription context implementation
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
