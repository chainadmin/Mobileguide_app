const API_BASE_URL = 'https://welcoming-elegance-production-9299.up.railway.app';

export async function getBuzzCount(mediaType: string, tmdbId: number): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buzz/${mediaType}/${tmdbId}`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.voteCount ?? 0;
  } catch (error) {
    console.error('Error getting buzz count:', error);
    return 0;
  }
}

export async function voteBuzz(mediaType: string, tmdbId: number): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buzz/${mediaType}/${tmdbId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.voteCount ?? 0;
  } catch (error) {
    console.error('Error voting buzz:', error);
    return 0;
  }
}

export async function getTopBuzz(): Promise<{ media_type: string; tmdb_id: number; vote_count: number }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buzz/top`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items ?? [];
  } catch (error) {
    console.error('Error getting top buzz:', error);
    return [];
  }
}
