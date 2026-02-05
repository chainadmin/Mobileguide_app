const API_BASE_URL = 'https://welcoming-elegance-production-9299.up.railway.app';

export async function getBuzzCount(region: string, mediaType: string, tmdbId: number): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buzz/${region}/${mediaType}/${tmdbId}`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.viewCount ?? 0;
  } catch (error) {
    console.error('Error getting buzz count:', error);
    return 0;
  }
}

export async function recordView(region: string, mediaType: string, tmdbId: number): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buzz/${region}/${mediaType}/${tmdbId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.viewCount ?? 0;
  } catch (error) {
    console.error('Error recording view:', error);
    return 0;
  }
}

export async function getTopBuzz(region: string): Promise<{ media_type: string; tmdb_id: number; view_count: number }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buzz/${region}/top`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items ?? [];
  } catch (error) {
    console.error('Error getting top buzz:', error);
    return [];
  }
}

export type WatchlistApiItem = {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  added_at: string;
};

export async function getWatchlist(guestId: string): Promise<WatchlistApiItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/${guestId}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items ?? [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
}

export async function addToWatchlistApi(
  guestId: string,
  item: { tmdbId: number; mediaType: string; title: string; posterPath: string | null }
): Promise<{ success: boolean; limitReached?: boolean; items?: WatchlistApiItem[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/${guestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (response.status === 403) {
      return { success: false, limitReached: true };
    }
    
    if (!response.ok) {
      return { success: false };
    }
    
    const data = await response.json();
    return { success: true, items: data.items };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false };
  }
}

export async function removeFromWatchlistApi(
  guestId: string,
  mediaType: string,
  tmdbId: number
): Promise<WatchlistApiItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/${guestId}/${mediaType}/${tmdbId}`, {
      method: 'DELETE'
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items ?? [];
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return [];
  }
}

export type SearchResultItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  isBuzzing?: boolean;
  buzzScore?: number;
};

export type SearchResults = {
  buzzing: SearchResultItem[];
  upcoming: SearchResultItem[];
  fallback: SearchResultItem[];
};

export async function searchContent(
  query: string,
  region: string,
  isPro: boolean
): Promise<SearchResults> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&region=${region}&isPro=${isPro}`
    );
    if (!response.ok) {
      return { buzzing: [], upcoming: [], fallback: [] };
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    return { buzzing: [], upcoming: [], fallback: [] };
  }
}
