import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getGuestId } from '../services/guestId';
import { 
  getWatchlist, 
  addToWatchlistApi, 
  removeFromWatchlistApi,
  WatchlistApiItem 
} from '../services/api';

export type WatchlistItem = {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  addedAt: number;
};

type WatchlistContextType = {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => Promise<{ success: boolean; limitReached?: boolean }>;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
  isFull: boolean;
  refreshWatchlist: () => Promise<void>;
  loading: boolean;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const MAX_ITEMS = 10;

function mapApiToLocal(items: WatchlistApiItem[]): WatchlistItem[] {
  return items.map(item => ({
    id: item.tmdb_id,
    mediaType: item.media_type,
    title: item.title,
    posterPath: item.poster_path,
    addedAt: new Date(item.added_at).getTime()
  }));
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const guestId = await getGuestId();
      const items = await getWatchlist(guestId);
      setWatchlist(mapApiToLocal(items));
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  async function addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): Promise<{ success: boolean; limitReached?: boolean }> {
    const exists = watchlist.some(w => w.id === item.id && w.mediaType === item.mediaType);
    if (exists) {
      return { success: true };
    }

    try {
      const guestId = await getGuestId();
      const result = await addToWatchlistApi(guestId, {
        tmdbId: item.id,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath
      });

      if (result.limitReached) {
        return { success: false, limitReached: true };
      }

      if (result.success && result.items) {
        setWatchlist(mapApiToLocal(result.items));
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return { success: false };
    }
  }

  async function removeFromWatchlist(id: number, mediaType: 'movie' | 'tv') {
    try {
      const guestId = await getGuestId();
      const items = await removeFromWatchlistApi(guestId, mediaType, id);
      setWatchlist(mapApiToLocal(items));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }

  function isInWatchlist(id: number, mediaType: 'movie' | 'tv'): boolean {
    return watchlist.some(w => w.id === id && w.mediaType === mediaType);
  }

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      isFull: watchlist.length >= MAX_ITEMS,
      refreshWatchlist: loadWatchlist,
      loading
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
