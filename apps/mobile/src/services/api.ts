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
