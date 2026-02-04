import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AlertItem = {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  enabled: boolean;
};

type AlertsContextType = {
  alerts: AlertItem[];
  toggleAlert: (tmdbId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  isAlertEnabled: (tmdbId: number, mediaType: 'movie' | 'tv') => boolean;
  loading: boolean;
};

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

const ALERTS_KEY = '@buzzreel_release_alerts';

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const stored = await AsyncStorage.getItem(ALERTS_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAlert(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    try {
      const existing = alerts.find(a => a.tmdbId === tmdbId && a.mediaType === mediaType);
      let newAlerts: AlertItem[];
      
      if (existing) {
        if (existing.enabled) {
          newAlerts = alerts.filter(a => !(a.tmdbId === tmdbId && a.mediaType === mediaType));
        } else {
          newAlerts = alerts.map(a => 
            a.tmdbId === tmdbId && a.mediaType === mediaType 
              ? { ...a, enabled: true } 
              : a
          );
        }
      } else {
        newAlerts = [...alerts, { tmdbId, mediaType, enabled: true }];
      }
      
      setAlerts(newAlerts);
      await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(newAlerts));
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  }

  const isAlertEnabled = useCallback((tmdbId: number, mediaType: 'movie' | 'tv'): boolean => {
    const alert = alerts.find(a => a.tmdbId === tmdbId && a.mediaType === mediaType);
    return alert?.enabled ?? false;
  }, [alerts]);

  return (
    <AlertsContext.Provider value={{
      alerts,
      toggleAlert,
      isAlertEnabled,
      loading
    }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
