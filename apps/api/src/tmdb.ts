const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TmdbTitle {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

export interface TmdbDetailedTitle extends TmdbTitle {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  status: string;
  tagline?: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResult {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

async function fetchTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY || '');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

export async function getTrending(mediaType: 'movie' | 'tv' | 'all', timeWindow: 'day' | 'week' = 'day'): Promise<TmdbTitle[]> {
  const data = await fetchTmdb<{ results: TmdbTitle[] }>(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
}

export async function getPopularMovies(region: string, providerIds?: number[]): Promise<TmdbTitle[]> {
  const params: Record<string, string> = {
    watch_region: region,
    sort_by: 'popularity.desc'
  };
  if (providerIds && providerIds.length > 0) {
    params.with_watch_providers = providerIds.join('|');
  }
  const data = await fetchTmdb<{ results: TmdbTitle[] }>('/discover/movie', params);
  return data.results.map(m => ({ ...m, media_type: 'movie' }));
}

export async function getPopularTV(region: string, providerIds?: number[]): Promise<TmdbTitle[]> {
  const params: Record<string, string> = {
    watch_region: region,
    sort_by: 'popularity.desc'
  };
  if (providerIds && providerIds.length > 0) {
    params.with_watch_providers = providerIds.join('|');
  }
  const data = await fetchTmdb<{ results: TmdbTitle[] }>('/discover/tv', params);
  return data.results.map(t => ({ ...t, media_type: 'tv' }));
}

export async function getTitleDetails(mediaType: 'movie' | 'tv', tmdbId: number): Promise<TmdbDetailedTitle> {
  return fetchTmdb<TmdbDetailedTitle>(`/${mediaType}/${tmdbId}`);
}

export async function getWatchProviders(mediaType: 'movie' | 'tv', tmdbId: number, region: string): Promise<WatchProvidersResult | null> {
  const data = await fetchTmdb<{ results: Record<string, WatchProvidersResult> }>(`/${mediaType}/${tmdbId}/watch/providers`);
  return data.results[region] || null;
}

export async function getUpcoming(region: string): Promise<TmdbTitle[]> {
  const today = new Date().toISOString().split('T')[0];
  const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const data = await fetchTmdb<{ results: TmdbTitle[] }>('/discover/movie', {
    'primary_release_date.gte': today,
    'primary_release_date.lte': twoWeeksLater,
    region,
    sort_by: 'primary_release_date.asc'
  });
  return data.results.map(m => ({ ...m, media_type: 'movie' }));
}

export async function searchMulti(queryText: string, page: number = 1): Promise<TmdbTitle[]> {
  const data = await fetchTmdb<{ results: TmdbTitle[] }>('/search/multi', {
    query: queryText,
    page: String(page),
    include_adult: 'false'
  });
  return data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
}
