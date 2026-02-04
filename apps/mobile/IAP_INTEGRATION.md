# In-App Purchases Integration Guide

This document describes how to integrate real in-app purchases using Expo's IAP library when you're ready to monetize the app.

## Current Implementation

The app uses a placeholder `EntitlementsContext` that stores Pro status in AsyncStorage. For development and testing, there's a DEV ONLY toggle in the Settings screen.

## Integration Steps

### 1. Install Expo IAP

```bash
npx expo install expo-in-app-purchases
```

### 2. Configure Products in App Stores

#### Apple App Store Connect
1. Create an App in App Store Connect
2. Go to Features > In-App Purchases
3. Create Subscription products:
   - `buzzreel_pro_monthly` - $1.99/month
   - `buzzreel_pro_yearly` - $9.99/year

#### Google Play Console
1. Create an App in Google Play Console
2. Go to Monetize > Products > Subscriptions
3. Create matching products with same IDs

### 3. Update EntitlementsContext

Replace the placeholder implementation in `src/context/EntitlementsContext.tsx`:

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_IDS = ['buzzreel_pro_monthly', 'buzzreel_pro_yearly'];

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePurchases();
  }, []);

  async function initializePurchases() {
    try {
      await InAppPurchases.connectAsync();
      
      // Set up purchase listener
      InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              InAppPurchases.finishTransactionAsync(purchase, true);
              setIsPro(true);
              // Store Pro status
              AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
            }
          }
        }
      });

      // Check existing purchases
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (results && results.length > 0) {
        // Verify subscription is still active
        const hasActive = results.some(p => isSubscriptionActive(p));
        setIsPro(hasActive);
      }
    } catch (error) {
      console.error('IAP initialization error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function purchaseSubscription(productId: string): Promise<boolean> {
    try {
      const { responseCode } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
      if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
        return false;
      }
      
      await InAppPurchases.purchaseItemAsync(productId);
      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  }

  async function restorePurchases(): Promise<boolean> {
    try {
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (results && results.length > 0) {
        const hasActive = results.some(p => isSubscriptionActive(p));
        if (hasActive) {
          setIsPro(true);
          await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }

  // ... rest of implementation
}
```

### 4. Update PaywallScreen

Connect the subscription buttons to actual purchase flow:

```typescript
const handleSubscribe = async () => {
  const productId = selectedPlan === 'monthly' 
    ? 'buzzreel_pro_monthly' 
    : 'buzzreel_pro_yearly';
    
  const success = await purchaseSubscription(productId);
  if (success) {
    navigation.goBack();
  }
};
```

### 5. Backend Validation (Recommended)

For production, validate receipts server-side:

1. Send purchase token to your backend
2. Verify with Apple/Google servers
3. Store subscription status in your database
4. Sync with app on launch

### 6. Testing

#### iOS Sandbox Testing
1. Create Sandbox Tester in App Store Connect
2. Sign out of App Store on device
3. Make test purchases (will use sandbox account)

#### Android Testing
1. Add test email to License Testing in Play Console
2. Publish to Internal Testing track
3. Test purchases are free

## Pro Features Checklist

When Pro is active:
- [x] Unlimited watchlist items (bypass 10-item limit)
- [x] Platform filters enabled in Settings
- [x] Release alerts UI shown
- [ ] No ads (implement ad removal when ads added)
- [ ] Push notifications for releases (requires separate setup)

## Environment Variables

No additional environment variables needed for IAP. Product IDs are hardcoded in the app.

## App Store Review Notes

Include in your App Store submission:
- In-App Purchase description
- Subscription terms (auto-renewal, cancellation policy)
- Privacy policy URL
- Terms of service URL
