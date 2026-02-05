import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeIAP, checkActiveSubscription, restorePurchases as iapRestorePurchases } from '../services/iap';

type EntitlementsContextType = {
  isPro: boolean;
  setPro: (value: boolean) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  refreshProStatus: () => Promise<void>;
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
        setLoading(false);
        return;
      }

      if (Platform.OS !== 'web') {
        await initializeIAP();
        const hasSubscription = await checkActiveSubscription();
        if (hasSubscription) {
          setIsPro(true);
          await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
        } else {
          const cachedStatus = await AsyncStorage.getItem(PRO_STATUS_KEY);
          setIsPro(cachedStatus === 'true');
        }
      } else {
        const proStatus = await AsyncStorage.getItem(PRO_STATUS_KEY);
        setIsPro(proStatus === 'true');
      }
    } catch (error) {
      console.error('Error loading pro status:', error);
      const cachedStatus = await AsyncStorage.getItem(PRO_STATUS_KEY);
      setIsPro(cachedStatus === 'true');
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

  async function refreshProStatus(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        const hasSubscription = await checkActiveSubscription();
        setIsPro(hasSubscription);
        await AsyncStorage.setItem(PRO_STATUS_KEY, hasSubscription ? 'true' : 'false');
      }
    } catch (error) {
      console.error('Error refreshing pro status:', error);
    }
  }

  async function restorePurchases(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Restore not available on web');
        return false;
      }

      const result = await iapRestorePurchases();
      
      if (result.hasActiveSubscription) {
        setIsPro(true);
        await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
        return true;
      }
      
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
      refreshProStatus,
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
