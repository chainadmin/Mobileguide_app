import crypto from 'crypto';

const API_KEY = process.env.PODCASTINDEX_API_KEY || '';
const API_SECRET = process.env.PODCASTINDEX_API_SECRET || '';
const BASE_URL = 'https://api.podcastindex.org/api/1.0';

function getAuthHeaders(): Record<string, string> {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash('sha1')
    .update(API_KEY + API_SECRET + apiHeaderTime)
    .digest('hex');

  return {
    'X-Auth-Key': API_KEY,
    'X-Auth-Date': apiHeaderTime.toString(),
    'Authorization': hash,
    'User-Agent': 'Buzzreel/1.0'
  };
}

async function podcastFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Podcast Index API error: ${response.status}`);
  }

  return response.json();
}

export type PodcastShow = {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  language: string;
  episodeCount: number;
  url?: string;
};

export type PodcastEpisode = {
  id: number;
  showId: number;
  showTitle: string;
  showImage: string;
  title: string;
  description: string;
  image: string;
  datePublished: number;
  duration: number;
  audioUrl: string;
};

export async function searchPodcasts(query: string, max: number = 20): Promise<PodcastShow[]> {
  try {
    const data = await podcastFetch('/search/byterm', { q: query, max: max.toString() });
    return (data.feeds || []).map((feed: any) => ({
      id: feed.id,
      title: feed.title || '',
      author: feed.author || feed.ownerName || '',
      image: feed.image || feed.artwork || '',
      description: feed.description || '',
      language: feed.language || 'en',
      episodeCount: feed.episodeCount || 0,
      url: feed.url
    }));
  } catch (error) {
    console.error('Error searching podcasts:', error);
    return [];
  }
}

export async function getTrendingPodcasts(max: number = 20, lang: string = 'en'): Promise<PodcastShow[]> {
  try {
    const data = await podcastFetch('/podcasts/trending', { max: max.toString(), lang });
    return (data.feeds || []).map((feed: any) => ({
      id: feed.id,
      title: feed.title || '',
      author: feed.author || feed.ownerName || '',
      image: feed.image || feed.artwork || '',
      description: feed.description || '',
      language: feed.language || 'en',
      episodeCount: feed.episodeCount || 0,
      url: feed.url
    }));
  } catch (error) {
    console.error('Error getting trending podcasts:', error);
    return [];
  }
}

export async function getRecentEpisodes(max: number = 20, lang: string = 'en'): Promise<PodcastEpisode[]> {
  try {
    const data = await podcastFetch('/recent/episodes', { max: max.toString(), lang });
    return (data.items || []).map((item: any) => ({
      id: item.id,
      showId: item.feedId,
      showTitle: item.feedTitle || '',
      showImage: item.feedImage || item.image || '',
      title: item.title || '',
      description: item.description || '',
      image: item.image || item.feedImage || '',
      datePublished: item.datePublished || 0,
      duration: item.duration || 0,
      audioUrl: item.enclosureUrl || ''
    }));
  } catch (error) {
    console.error('Error getting recent episodes:', error);
    return [];
  }
}

export async function getPodcastById(id: number): Promise<PodcastShow | null> {
  try {
    const data = await podcastFetch('/podcasts/byfeedid', { id: id.toString() });
    const feed = data.feed;
    if (!feed) return null;
    
    return {
      id: feed.id,
      title: feed.title || '',
      author: feed.author || feed.ownerName || '',
      image: feed.image || feed.artwork || '',
      description: feed.description || '',
      language: feed.language || 'en',
      episodeCount: feed.episodeCount || 0,
      url: feed.url
    };
  } catch (error) {
    console.error('Error getting podcast by id:', error);
    return null;
  }
}

export async function getEpisodeById(id: number): Promise<PodcastEpisode | null> {
  try {
    const data = await podcastFetch('/episodes/byid', { id: id.toString() });
    const item = data.episode;
    if (!item) return null;
    
    return {
      id: item.id,
      showId: item.feedId,
      showTitle: item.feedTitle || '',
      showImage: item.feedImage || item.image || '',
      title: item.title || '',
      description: item.description || '',
      image: item.image || item.feedImage || '',
      datePublished: item.datePublished || 0,
      duration: item.duration || 0,
      audioUrl: item.enclosureUrl || ''
    };
  } catch (error) {
    console.error('Error getting episode by id:', error);
    return null;
  }
}

export async function getEpisodesByShowId(showId: number, max: number = 20): Promise<PodcastEpisode[]> {
  try {
    const data = await podcastFetch('/episodes/byfeedid', { id: showId.toString(), max: max.toString() });
    return (data.items || []).map((item: any) => ({
      id: item.id,
      showId: item.feedId,
      showTitle: item.feedTitle || '',
      showImage: item.feedImage || item.image || '',
      title: item.title || '',
      description: item.description || '',
      image: item.image || item.feedImage || '',
      datePublished: item.datePublished || 0,
      duration: item.duration || 0,
      audioUrl: item.enclosureUrl || ''
    }));
  } catch (error) {
    console.error('Error getting episodes by show id:', error);
    return [];
  }
}

export function validatePodcastApiKeys(): boolean {
  if (!API_KEY || !API_SECRET) {
    console.warn('Podcast Index API keys not configured');
    return false;
  }
  return true;
}
