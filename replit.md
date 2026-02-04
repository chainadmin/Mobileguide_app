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

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development**: tsx for hot-reloading during development
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Current Endpoints**:
  - `GET /health` - Service health check
  - `GET /api/trending` - Trending content
  - `GET /api/buzz` - Buzz topics
  - `GET /api/upcoming` - Upcoming releases
  - `GET /api/title/:mediaType/:tmdbId` - Title details
- **Port**: Defaults to 4000, configurable via PORT environment variable

### Data Layer
- **Database**: PostgreSQL hosted on Railway
- **Migrations**: SQL files stored in `db/migrations/` directory
- **Buzz Votes Table**: Stores anonymous engagement data with unique constraint on (media_type, tmdb_id)

## External Dependencies

### Mobile App
- **Expo**: Managed workflow for React Native development
- **React Navigation**: Navigation library for routing between screens
- **react-native-screens** & **react-native-safe-area-context**: Native navigation primitives

### API
- **Express**: Web framework for REST API
- **pg**: PostgreSQL client for Node.js
- **tsx**: TypeScript execution and hot-reloading for development

### External Integrations
- **TMDB (The Movie Database)**: Live integration with TMDB API for trending, upcoming, and title details
  - Uses EXPO_PUBLIC_TMDB_API_KEY environment variable (bearer token)
  - Service file: `src/services/tmdb.ts`
  - Attribution displayed in Settings screen as required by TMDB terms
- **Streaming Provider Data**: Watch provider info fetched via TMDB API (JustWatch data)

## Recent Changes
- **Feb 2026**: Implemented anonymous buzz voting system
  - API deployed on Railway with PostgreSQL database
  - Railway URL: welcoming-elegance-production-9299.up.railway.app
  - BuzzMeter component is tappable to submit votes
  - TitleDetailScreen fetches and displays live buzz counts
  - API endpoints: GET/POST /api/buzz/:mediaType/:tmdbId, GET /api/buzz/top
- **Feb 2026**: Integrated TMDB API for real movie/TV data
  - TrendingScreen and UpcomingScreen now fetch live data
  - TitleDetailScreen shows full details with streaming providers
  - PosterCard is tappable and navigates to detail view
  - Settings includes TMDB attribution