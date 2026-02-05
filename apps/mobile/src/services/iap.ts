import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';

export const PRODUCT_IDS = {
  MONTHLY: 'buzzreel_pro_monthly',
  YEARLY: 'buzzreel_pro_yearly'
};

const ALL_PRODUCT_IDS = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY];

let isConnected = false;
let purchaseListener: InAppPurchases.IAPItemDetails[] | null = null;

export async function initializeIAP(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      console.log('IAP not available on web');
      return false;
    }

    await InAppPurchases.connectAsync();
    isConnected = true;
    console.log('IAP connected successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to IAP:', error);
    return false;
  }
}

export async function getProducts(): Promise<InAppPurchases.IAPItemDetails[]> {
  try {
    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) return [];
    }

    const { results } = await InAppPurchases.getProductsAsync(ALL_PRODUCT_IDS);
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
    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) {
        onError('Unable to connect to the store. Please try again.');
        return;
      }
    }

    InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results?.forEach(async (purchase) => {
          if (!purchase.acknowledged) {
            await InAppPurchases.finishTransactionAsync(purchase, true);
          }
        });
        onSuccess();
      } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
        onError('Purchase was canceled');
      } else {
        onError('Purchase failed. Please try again.');
      }
    });

    await InAppPurchases.purchaseItemAsync(productId);
  } catch (error) {
    console.error('Error purchasing:', error);
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

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) {
        return { success: false, hasActiveSubscription: false };
      }
    }

    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    
    if (results && results.length > 0) {
      const hasActive = results.some((purchase) => {
        const productId = purchase.productId;
        return productId === PRODUCT_IDS.MONTHLY || productId === PRODUCT_IDS.YEARLY;
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

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) return false;
    }

    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    
    if (results && results.length > 0) {
      return results.some((purchase) => {
        const productId = purchase.productId;
        return productId === PRODUCT_IDS.MONTHLY || productId === PRODUCT_IDS.YEARLY;
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
    if (isConnected) {
      await InAppPurchases.disconnectAsync();
      isConnected = false;
    }
  } catch (error) {
    console.error('Error disconnecting IAP:', error);
  }
}
