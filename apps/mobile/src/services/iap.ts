import { Platform } from 'react-native';

export const PRODUCT_IDS = {
  MONTHLY: 'buzzreel_pro_monthly',
  YEARLY: 'buzzreel_pro_yearly',
  LIFETIME: 'buzzreel_pro_lifetime'
};

const SUBSCRIPTION_IDS = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY];
const ONE_TIME_IDS = [PRODUCT_IDS.LIFETIME];

let isConnected = false;
let purchaseSubscription_: any = null;
let errorSubscription_: any = null;
let cachedProducts: any[] = [];
let iapUnavailable = false;
let purchaseCallbacks: {
  onSuccess: () => void;
  onError: (error: string) => void;
} | null = null;

async function getIAPModule() {
  if (Platform.OS === 'web' || iapUnavailable) {
    return null;
  }
  try {
    const mod = await import('expo-iap');
    const iapModule = mod?.initConnection ? mod : mod?.default?.initConnection ? mod.default : null;
    if (!iapModule) {
      iapUnavailable = true;
      return null;
    }
    return iapModule;
  } catch {
    iapUnavailable = true;
    return null;
  }
}

export async function initializeIAP(): Promise<boolean> {
  try {
    if (Platform.OS === 'web' || iapUnavailable) {
      return false;
    }

    const IAP = await getIAPModule();
    if (!IAP) return false;

    if (isConnected) {
      return true;
    }

    await IAP.initConnection();
    isConnected = true;

    if (!purchaseSubscription_) {
      purchaseSubscription_ = IAP.purchaseUpdatedListener((purchase: any) => {
        handlePurchaseSuccess(IAP, purchase);
      });
    }

    if (!errorSubscription_) {
      errorSubscription_ = IAP.purchaseErrorListener((error: any) => {
        handlePurchaseError(error);
      });
    }

    return true;
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('native') || msg.includes('NativeModule') || msg.includes('turboModule')) {
      iapUnavailable = true;
    }
    return false;
  }
}

async function handlePurchaseSuccess(IAP: any, purchase: any) {
  try {
    const state = purchase.purchaseState || purchase.purchaseStateAndroid;
    const isPurchased = state === 'purchased' || state === 1;

    if (isPurchased || purchase.transactionReceipt || purchase.purchaseToken) {
      await IAP.finishTransaction({
        purchase,
        isConsumable: false,
      });
    }

    if (purchaseCallbacks?.onSuccess) {
      purchaseCallbacks.onSuccess();
      purchaseCallbacks = null;
    }
  } catch (err) {
    console.log('Error finishing transaction:', err);
  }
}

function handlePurchaseError(error: any) {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  const isCancel =
    errorCode === 'UserCancelled' ||
    errorCode === 'E_USER_CANCELLED' ||
    errorMessage.includes('cancel');

  if (purchaseCallbacks?.onError) {
    purchaseCallbacks.onError(isCancel ? 'canceled' : 'Purchase failed. Please try again.');
    purchaseCallbacks = null;
  }
}

function getOfferTokenForProduct(productId: string): string {
  const product = cachedProducts.find((p: any) => p.id === productId);
  if (!product) return '';

  if (product.subscriptionOffers && product.subscriptionOffers.length > 0) {
    return product.subscriptionOffers[0].offerTokenAndroid || '';
  }

  if (product.subscriptionOfferDetailsAndroid && product.subscriptionOfferDetailsAndroid.length > 0) {
    return product.subscriptionOfferDetailsAndroid[0].offerToken || '';
  }

  return '';
}

export async function getProducts(): Promise<any[]> {
  try {
    if (Platform.OS === 'web' || iapUnavailable) return [];

    const IAP = await getIAPModule();
    if (!IAP) return [];

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) return [];
    }

    const subs = await IAP.fetchProducts({
      skus: SUBSCRIPTION_IDS,
      type: 'subs',
    });

    const inApp = await IAP.fetchProducts({
      skus: ONE_TIME_IDS,
      type: 'in-app',
    });

    cachedProducts = [...(subs || []), ...(inApp || [])];
    return cachedProducts;
  } catch {
    return [];
  }
}

export async function purchaseSubscription(
  productId: string,
  onSuccess: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    if (Platform.OS === 'web' || iapUnavailable) {
      onError('Purchases are not available in this environment');
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

    if (cachedProducts.length === 0) {
      await getProducts();
    }

    purchaseCallbacks = { onSuccess, onError };

    const isSubscription = SUBSCRIPTION_IDS.includes(productId);

    if (isSubscription) {
      const offerToken = getOfferTokenForProduct(productId);

      await IAP.requestPurchase({
        request: {
          apple: { sku: productId },
          google: {
            skus: [productId],
            subscriptionOffers: [{ sku: productId, offerToken }],
          },
        },
        type: 'subs' as const,
      });
    } else {
      await IAP.requestPurchase({
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
        type: 'in-app' as const,
      });
    }
  } catch {
    purchaseCallbacks = null;
    onError('An error occurred during purchase. Please try again.');
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  hasActiveSubscription: boolean;
}> {
  try {
    if (Platform.OS === 'web' || iapUnavailable) {
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

    const purchases = await IAP.getAvailablePurchases();

    if (purchases && purchases.length > 0) {
      const hasActive = purchases.some((purchase: any) => {
        const pid = purchase.productId;
        const isValidPurchase = pid === PRODUCT_IDS.MONTHLY ||
                                pid === PRODUCT_IDS.YEARLY ||
                                pid === PRODUCT_IDS.LIFETIME;
        return isValidPurchase;
      });

      return { success: true, hasActiveSubscription: hasActive };
    }

    return { success: true, hasActiveSubscription: false };
  } catch {
    return { success: false, hasActiveSubscription: false };
  }
}

export async function checkActiveSubscription(): Promise<boolean> {
  try {
    if (Platform.OS === 'web' || iapUnavailable) {
      return false;
    }

    const IAP = await getIAPModule();
    if (!IAP) return false;

    if (!isConnected) {
      const connected = await initializeIAP();
      if (!connected) return false;
    }

    const hasSubs = await IAP.hasActiveSubscriptions(SUBSCRIPTION_IDS);
    if (hasSubs) return true;

    const purchases = await IAP.getAvailablePurchases();
    if (purchases && purchases.length > 0) {
      return purchases.some((purchase: any) => {
        return purchase.productId === PRODUCT_IDS.LIFETIME;
      });
    }

    return false;
  } catch {
    return false;
  }
}

export async function disconnectIAP(): Promise<void> {
  try {
    if (Platform.OS === 'web' || iapUnavailable) return;

    const IAP = await getIAPModule();
    if (!IAP) return;

    if (isConnected) {
      if (purchaseSubscription_) {
        purchaseSubscription_.remove();
        purchaseSubscription_ = null;
      }
      if (errorSubscription_) {
        errorSubscription_.remove();
        errorSubscription_ = null;
      }
      await IAP.endConnection();
      isConnected = false;
      cachedProducts = [];
    }
  } catch {
  }
}
