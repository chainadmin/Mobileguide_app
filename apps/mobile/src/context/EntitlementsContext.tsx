import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EntitlementsContextType = {
  isPro: boolean;
  setPro: (value: boolean) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  loading: boolean;
};

const EntitlementsContext = createContext<EntitlementsContextType | undefined>(undefined);

const PRO_STATUS_KEY = '@buzzreel_pro_status';
const DEV_TOGGLE_KEY = '@buzzreel_dev_pro_toggle';

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProStatus();
  }, []);

  async function loadProStatus() {
    try {
      const devToggle = await AsyncStorage.getItem(DEV_TOGGLE_KEY);
      if (devToggle === 'true') {
        setIsPro(true);
      } else {
        const proStatus = await AsyncStorage.getItem(PRO_STATUS_KEY);
        setIsPro(proStatus === 'true');
      }
    } catch (error) {
      console.error('Error loading pro status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function setPro(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(DEV_TOGGLE_KEY, value ? 'true' : 'false');
      setIsPro(value);
    } catch (error) {
      console.error('Error setting pro status:', error);
    }
  }

  async function restorePurchases(): Promise<boolean> {
    try {
      console.log('Restore purchases called - placeholder');
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  return (
    <EntitlementsContext.Provider value={{
      isPro,
      setPro,
      restorePurchases,
      loading
    }}>
      {children}
    </EntitlementsContext.Provider>
  );
}

export function useEntitlements() {
  const context = useContext(EntitlementsContext);
  if (!context) {
    throw new Error('useEntitlements must be used within an EntitlementsProvider');
  }
  return context;
}
