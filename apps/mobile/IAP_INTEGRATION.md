# In-App Purchases Integration Guide

This document describes the in-app purchase integration using `expo-iap` (Play Billing Library v8.0+).

## Current Implementation

The app uses `expo-iap` for real in-app purchases on iOS (StoreKit 2) and Android (Play Billing v8.0).
For development and testing, there's a DEV ONLY toggle in the Settings screen.

## Product IDs

- `buzzreel_pro_monthly` - $1.99/month (subscription)
- `buzzreel_pro_yearly` - $9.99/year (subscription)
- `buzzreel_pro_lifetime` - $24.99 one-time (in-app purchase)

## Architecture

### Service Layer (`src/services/iap.ts`)
- `initializeIAP()` - Connects to store, sets up purchase/error listeners
- `getProducts()` - Fetches subscription and in-app product metadata
- `purchaseSubscription(productId, onSuccess, onError)` - Initiates purchase flow
- `restorePurchases()` - Restores previous purchases
- `checkActiveSubscription()` - Checks for active subscriptions or lifetime purchase
- `disconnectIAP()` - Cleans up listeners and disconnects

### Context Layer (`src/context/EntitlementsContext.tsx`)
- `EntitlementsProvider` wraps the app and manages Pro status
- Checks active subscriptions on mount
- Caches Pro status in AsyncStorage
- Dev toggle only works in `__DEV__` mode

### PaywallScreen (`src/screens/PaywallScreen.tsx`)
- Shows plan options (Monthly, Yearly, Lifetime)
- Triggers real store purchases on mobile
- Web platform handled gracefully

## Configuration

### app.json plugins
```json
{
  "plugins": [
    "expo-iap",
    ["expo-build-properties", {
      "android": { "kotlinVersion": "2.2.0" }
    }]
  ]
}
```

### Android Permissions
```json
{
  "permissions": [
    "com.google.android.gms.permission.AD_ID",
    "com.android.vending.BILLING"
  ]
}
```

## Configure Products in App Stores

### Apple App Store Connect
1. Create an App in App Store Connect
2. Go to Features > In-App Purchases
3. Create Subscription products:
   - `buzzreel_pro_monthly` - $1.99/month
   - `buzzreel_pro_yearly` - $9.99/year
4. Create Non-Consumable product:
   - `buzzreel_pro_lifetime` - $24.99

### Google Play Console
1. Create an App in Google Play Console
2. Go to Monetize > Products > Subscriptions
3. Create matching subscription products with same IDs
4. Go to Monetize > Products > In-app products
5. Create lifetime product

## Testing

### iOS Sandbox Testing
1. Create Sandbox Tester in App Store Connect
2. Sign out of App Store on device
3. Make test purchases (will use sandbox account)

### Android Testing
1. Add test email to License Testing in Play Console
2. Publish to Internal Testing track
3. Test purchases are free

## Pro Features Checklist

When Pro is active:
- [x] Unlimited watchlist items (bypass 10-item limit)
- [x] Platform filters enabled in Settings
- [x] Release alerts UI shown
- [x] No ads (ad-free experience)
- [ ] Push notifications for releases (requires separate setup)

## Environment Variables

No additional environment variables needed for IAP. Product IDs are hardcoded in the app.
