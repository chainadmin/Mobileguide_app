import { Platform } from 'react-native';

export const PRODUCT_IDS = {
  MONTHLY: 'buzzreel_pro_monthly',
  YEARLY: 'buzzreel_pro_yearly',
  LIFETIME: 'buzzreel_pro_lifetime'
};

const ALL_PRODUCT_IDS = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY, PRODUCT_IDS.LIFETIME];

let isConnected = false;
let listenerRegistered = false;
let iapModule: typeof import('expo-in-app-purchases') | null = null;
let purchaseCallbacks: {
  onSuccess: () => void;
  onError: (error: string) => void;
} | null = null;

async function getIAPModule() {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!iapModule) {
    try {
      iapModule = await import('expo-in-app-purchases');
    } catch (error) {
      console.log('IAP module not available:', error);
      return null;
    }
  }
  return iapModule;
}

export async function initializeIAP(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      console.log('IAP not available on web');
      return false;
    }

    const IAP = await getIAPModule();
    if (!IAP) return false;

    if (isConnected) {
      return true;
    }

    await IAP.connectAsync();
    isConnected = true;
    
    if (!listenerRegistered) {
      IAP.setPurchaseListener(({ responseCode, results }) => {
        handlePurchaseUpdate(responseCode, results);
      });
      listenerRegistered = true;
    }
    
    console.log('IAP connected successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to IAP:', error);
    return false;
  }
}

async function handlePurchaseUpdate(responseCode: number, results?: any[]) {
  const IAP = await getIAPModule();
  if (!IAP) return;

  if (responseCode === IAP.IAPResponseCode.OK) {
    results?.forEach(async (purchase) => {
      if (!purchase.acknowledged) {
        try {
          await IAP.finishTransactionAsync(purchase, true);
          console.log('Transaction finished:', purchase.productId);
        } catch (err) {
          console.error('Error finishing transaction:', err);
        }
      }
    });
    
    if (purchaseCallbacks?.onSuccess) {
      purchaseCallbacks.onSuccess();
      purchaseCallbacks = null;
    }
  } else if (responseCode === IAP.IAPResponseCode.USER_CANCELED) {
    if (purchaseCallbacks?.onError) {
      purchaseCallbacks.onError('canceled');
      purchaseCallbacks = null;
    }
  } else {
    if (purchaseCallbacks?.onError) {
      purchaseCallbacks.onError('Purchase failed. Please try again.');
      purchaseCallbacks = null;
    }
  }
}

export async function getProducts(): Promise<any[]> {
  try {
    if (Platform.OS === 'web') return [];
    
    const IAP = await getIAPModule();
    if (!IAP) return [];

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) return [];
    }

    const { results } = await IAP.getProductsAsync(ALL_PRODUCT_IDS);
    return results || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function purchaseSubscription(
  productId: string,
  onSuccess: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      onError('Purchases are not available on web');
      return;
    }

    const IAP = await getIAPModule();
    if (!IAP) {
      onError('Unable to connect to the store. Please try again.');
      return;
    }

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) {
        onError('Unable to connect to the store. Please try again.');
        return;
      }
    }

    purchaseCallbacks = { onSuccess, onError };
    await IAP.purchaseItemAsync(productId);
  } catch (error) {
    console.error('Error purchasing:', error);
    purchaseCallbacks = null;
    onError('An error occurred during purchase. Please try again.');
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  hasActiveSubscription: boolean;
}> {
  try {
    if (Platform.OS === 'web') {
      return { success: false, hasActiveSubscription: false };
    }

    const IAP = await getIAPModule();
    if (!IAP) {
      return { success: false, hasActiveSubscription: false };
    }

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) {
        return { success: false, hasActiveSubscription: false };
      }
    }

    const { results } = await IAP.getPurchaseHistoryAsync();
    
    if (results && results.length > 0) {
      const hasActive = results.some((purchase: any) => {
        const productId = purchase.productId;
        const isValidPurchase = productId === PRODUCT_IDS.MONTHLY || 
                                productId === PRODUCT_IDS.YEARLY || 
                                productId === PRODUCT_IDS.LIFETIME;
        return isValidPurchase && purchase.acknowledged;
      });
      
      return { success: true, hasActiveSubscription: hasActive };
    }

    return { success: true, hasActiveSubscription: false };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return { success: false, hasActiveSubscription: false };
  }
}

export async function checkActiveSubscription(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return false;
    }

    const IAP = await getIAPModule();
    if (!IAP) return false;

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) return false;
    }

    const { results } = await IAP.getPurchaseHistoryAsync();
    
    if (results && results.length > 0) {
      return results.some((purchase: any) => {
        const productId = purchase.productId;
        const isValidPurchase = productId === PRODUCT_IDS.MONTHLY || 
                                productId === PRODUCT_IDS.YEARLY || 
                                productId === PRODUCT_IDS.LIFETIME;
        return isValidPurchase && purchase.acknowledged;
      });
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function disconnectIAP(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;

    const IAP = await getIAPModule();
    if (!IAP) return;

    if (isConnected) {
      await IAP.disconnectAsync();
      isConnected = false;
      listenerRegistered = false;
    }
  } catch (error) {
    console.error('Error disconnecting IAP:', error);
  }
}
