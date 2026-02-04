import { getCached, setCache } from './cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '';

export type MediaType = 'movie' | 'tv';

export type TrendingItem = {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
};

export type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  runtime: number;
  release_date: string;
  genres: { id: number; name: string }[];
  tagline: string;
};

export type TVDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  episode_run_time: number[];
  first_air_date: string;
  genres: { id: number; name: string }[];
  tagline: string;
  number_of_seasons: number;
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

export type WatchProviderResult = {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

export async function getTrending(
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  timeWindow: 'day' | 'week' = 'day'
): Promise<TrendingItem[]> {
  const data = await fetchTMDB<{ results: TrendingItem[] }>(
    `/trending/${mediaType}/${timeWindow}`
  );
  return data.results;
}

export async function getPopularMovies(region: string = 'US'): Promise<TrendingItem[]> {
  const [streamable, local] = await Promise.all([
    fetchTMDB<{ results: TrendingItem[] }>('/discover/movie', {
      watch_region: region,
      with_watch_monetization_types: 'flatrate|free|ads',
      sort_by: 'popularity.desc',
      'vote_count.gte': '20'
    }),
    fetchTMDB<{ results: TrendingItem[] }>('/discover/movie', {
      with_origin_country: region,
      sort_by: 'popularity.desc',
      'vote_count.gte': '10'
    })
  ]);
  
  const seen = new Set<number>();
  const combined: TrendingItem[] = [];
  
  // Prioritize local content first (content from the region)
  for (const item of local.results.slice(0, 10)) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      combined.push({ ...item, media_type: 'movie' as MediaType });
    }
  }
  
  // Then add streamable content
  for (const item of streamable.results) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      combined.push({ ...item, media_type: 'movie' as MediaType });
    }
  }
  
  return combined.slice(0, 20);
}

export async function getPopularTV(region: string = 'US'): Promise<TrendingItem[]> {
  const [streamable, local] = await Promise.all([
    fetchTMDB<{ results: TrendingItem[] }>('/discover/tv', {
      watch_region: region,
      with_watch_monetization_types: 'flatrate|free|ads',
      sort_by: 'popularity.desc',
      'vote_count.gte': '20'
    }),
    fetchTMDB<{ results: TrendingItem[] }>('/discover/tv', {
      with_origin_country: region,
      sort_by: 'popularity.desc',
      'vote_count.gte': '10'
    })
  ]);
  
  const seen = new Set<number>();
  const combined: TrendingItem[] = [];
  
  // Prioritize local content first (content from the region)
  for (const item of local.results.slice(0, 10)) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      combined.push({ ...item, media_type: 'tv' as MediaType });
    }
  }
  
  // Then add streamable content
  for (const item of streamable.results) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      combined.push({ ...item, media_type: 'tv' as MediaType });
    }
  }
  
  return combined.slice(0, 20);
}

export async function getRegionalContent(region: string = 'US'): Promise<TrendingItem[]> {
  console.log(`Fetching content for region: ${region}`);
  const [movies, tvShows] = await Promise.all([
    getPopularMovies(region),
    getPopularTV(region)
  ]);
  console.log(`Got ${movies.length} movies and ${tvShows.length} TV shows for ${region}`);
  console.log(`First movie: ${movies[0]?.title || 'none'}, First TV: ${tvShows[0]?.name || 'none'}`);
  
  const combined = [...movies.slice(0, 10), ...tvShows.slice(0, 10)];
  const sorted = combined.sort((a, b) => b.vote_average - a.vote_average);
  
  return sorted;
}

export async function getUpcoming(region: string = 'US'): Promise<TrendingItem[]> {
  const cacheKey = `@buzzreel_cache_upcoming_${region}`;
  const cached = await getCached<TrendingItem[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchTMDB<{ results: TrendingItem[] }>('/movie/upcoming', {
    region
  });
  const results = data.results.map(item => ({ ...item, media_type: 'movie' as MediaType }));
  
  await setCache(cacheKey, results);
  return results;
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  const cacheKey = `@buzzreel_cache_movie_${movieId}`;
  const cached = await getCached<MovieDetails>(cacheKey);
  if (cached) return cached;

  const data = await fetchTMDB<MovieDetails>(`/movie/${movieId}`);
  await setCache(cacheKey, data);
  return data;
}

export async function getTVDetails(tvId: number): Promise<TVDetails> {
  const cacheKey = `@buzzreel_cache_tv_${tvId}`;
  const cached = await getCached<TVDetails>(cacheKey);
  if (cached) return cached;

  const data = await fetchTMDB<TVDetails>(`/tv/${tvId}`);
  await setCache(cacheKey, data);
  return data;
}

export async function getWatchProviders(
  mediaType: MediaType,
  id: number,
  region: string = 'US'
): Promise<WatchProviderResult | null> {
  const data = await fetchTMDB<{ results: Record<string, WatchProviderResult> }>(
    `/${mediaType}/${id}/watch/providers`
  );
  return data.results[region] || null;
}

export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
  if (!path) return 'https://via.placeholder.com/342x513?text=No+Image';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w780'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function formatRuntime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function calculateBuzz(voteAverage: number): number {
  return Math.round(voteAverage * 10);
}
