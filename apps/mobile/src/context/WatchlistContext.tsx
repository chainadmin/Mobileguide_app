import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WatchlistItem = {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  addedAt: number;
};

type WatchlistContextType = {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => Promise<boolean>;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
  isFull: boolean;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const STORAGE_KEY = '@buzzreel_watchlist';
const MAX_ITEMS = 10;

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function loadWatchlist() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  }

  async function saveWatchlist(items: WatchlistItem[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setWatchlist(items);
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  }

  async function addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): Promise<boolean> {
    if (watchlist.length >= MAX_ITEMS) {
      return false;
    }
    
    const exists = watchlist.some(w => w.id === item.id && w.mediaType === item.mediaType);
    if (exists) {
      return true;
    }

    const newItem: WatchlistItem = {
      ...item,
      addedAt: Date.now()
    };
    
    await saveWatchlist([...watchlist, newItem]);
    return true;
  }

  async function removeFromWatchlist(id: number, mediaType: 'movie' | 'tv') {
    const filtered = watchlist.filter(w => !(w.id === id && w.mediaType === mediaType));
    await saveWatchlist(filtered);
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
      isFull: watchlist.length >= MAX_ITEMS
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
