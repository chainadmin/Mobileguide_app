import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PlatformFiltersContextType = {
  selectedPlatforms: string[];
  togglePlatform: (platformId: string) => Promise<void>;
  isEnabled: boolean;
  setEnabled: (value: boolean) => Promise<void>;
  loading: boolean;
};

const PlatformFiltersContext = createContext<PlatformFiltersContextType | undefined>(undefined);

const PLATFORMS_KEY = '@buzzreel_selected_platforms';
const FILTERS_ENABLED_KEY = '@buzzreel_filters_enabled';

export const STREAMING_PLATFORMS = [
  { id: '8', name: 'Netflix', logo: '🔴' },
  { id: '337', name: 'Disney+', logo: '🏰' },
  { id: '1899', name: 'Max', logo: '💜' },
  { id: '9', name: 'Amazon Prime', logo: '📦' },
  { id: '15', name: 'Hulu', logo: '💚' },
  { id: '350', name: 'Apple TV+', logo: '🍎' },
  { id: '531', name: 'Paramount+', logo: '⛰️' },
  { id: '387', name: 'Peacock', logo: '🦚' },
  { id: '283', name: 'Crunchyroll', logo: '🍊' },
  { id: '386', name: 'Tubi', logo: '🟣' }
];

export function PlatformFiltersProvider({ children }: { children: ReactNode }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  async function loadFilters() {
    try {
      const platforms = await AsyncStorage.getItem(PLATFORMS_KEY);
      const enabled = await AsyncStorage.getItem(FILTERS_ENABLED_KEY);
      if (platforms) {
        setSelectedPlatforms(JSON.parse(platforms));
      }
      setIsEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error loading platform filters:', error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePlatform(platformId: string): Promise<void> {
    try {
      const newPlatforms = selectedPlatforms.includes(platformId)
        ? selectedPlatforms.filter(id => id !== platformId)
        : [...selectedPlatforms, platformId];
      
      setSelectedPlatforms(newPlatforms);
      await AsyncStorage.setItem(PLATFORMS_KEY, JSON.stringify(newPlatforms));
    } catch (error) {
      console.error('Error toggling platform:', error);
    }
  }

  async function setEnabled(value: boolean): Promise<void> {
    try {
      setIsEnabled(value);
      await AsyncStorage.setItem(FILTERS_ENABLED_KEY, value ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting filters enabled:', error);
    }
  }

  return (
    <PlatformFiltersContext.Provider value={{
      selectedPlatforms,
      togglePlatform,
      isEnabled,
      setEnabled,
      loading
    }}>
      {children}
    </PlatformFiltersContext.Provider>
  );
}

export function usePlatformFilters() {
  const context = useContext(PlatformFiltersContext);
  if (!context) {
    throw new Error('usePlatformFilters must be used within a PlatformFiltersProvider');
  }
  return context;
}
