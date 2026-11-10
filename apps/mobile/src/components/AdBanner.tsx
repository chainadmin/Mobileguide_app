import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEntitlements } from '../context/EntitlementsContext';
import { colors, spacing } from '../theme';

// Ads run on Android only for now; iOS stays ad-free.
const AD_UNIT_ID = 'ca-app-pub-1580761947831808/1129971883';

// The native module is missing in Expo Go and on builds made without the
// config plugin. Requiring it inside try/catch keeps the app from crashing
// in those cases; the banner simply never shows.
let GoogleMobileAds: typeof import('react-native-google-mobile-ads') | null = null;
if (Platform.OS === 'android') {
  try {
    GoogleMobileAds = require('react-native-google-mobile-ads');
  } catch (e) {
    console.log('Google Mobile Ads not available:', e);
  }
}

let sdkInit: Promise<unknown> | null = null;
const initializeAds = () => {
  if (!GoogleMobileAds) return Promise.reject(new Error('Ads unavailable'));
  if (!sdkInit) {
    try {
      sdkInit = GoogleMobileAds.default().initialize().catch((e) => {
        sdkInit = null;
        throw e;
      });
    } catch (e) {
      sdkInit = null;
      return Promise.reject(e);
    }
  }
  return sdkInit;
};

// Wait this long after launch before starting the ads SDK, so it does not
// compete with the first screen for memory and the main thread.
const INIT_DELAY_MS = 3000;

/**
 * A single banner shared by every tab. It is rendered once, between the tab
 * screens and the tab bar (see App.tsx), and never inside individual screens:
 * the tab navigator keeps visited screens mounted, so a banner per screen
 * meant up to four live AdMob WebViews loading and refreshing at once, a
 * common cause of out-of-memory and WebView renderer crashes on Android.
 */
const AdBanner = () => {
  const { isPro, loading } = useEntitlements();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading || isPro || dismissed || ready) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      initializeAds()
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch((e) => console.log('Ads failed to initialize:', e));
    }, INIT_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loading, isPro, dismissed, ready]);

  useEffect(() => {
    if (!adLoaded) return;
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true
    }).start();
  }, [adLoaded, opacity]);

  const handleClose = () => {
    // Unmount right away instead of after an animation: the callback of an
    // animation can fire after the view is gone.
    setDismissed(true);
  };

  if (!GoogleMobileAds || loading || isPro || dismissed || adError || !ready) {
    return null;
  }

  const { BannerAd, BannerAdSize, TestIds } = GoogleMobileAds;
  const unitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : AD_UNIT_ID;

  return (
    <Animated.View
      style={[styles.container, { opacity }, !adLoaded && styles.collapsed]}
      pointerEvents={adLoaded ? 'box-none' : 'none'}
    >
      {adLoaded && (
        <View style={styles.header}>
          <Text style={styles.adLabel}>AD</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Close ad"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={REQUEST_OPTIONS}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.log('Ad failed to load:', error);
          setAdError(true);
        }}
      />
    </Animated.View>
  );
};

// Kept stable so the native view is not handed a "new" request every render.
const REQUEST_OPTIONS = { requestNonPersonalizedAdsOnly: true };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  // Until an ad arrives the banner takes no space and is invisible, but it
  // stays mounted so the ad can load.
  collapsed: {
    height: 0,
    borderTopWidth: 0,
    overflow: 'hidden'
  },
  header: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  adLabel: {
    backgroundColor: colors.textMuted,
    color: colors.background,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    overflow: 'hidden'
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  }
});

export default AdBanner;
