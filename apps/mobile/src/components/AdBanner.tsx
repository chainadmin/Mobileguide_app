import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEntitlements } from '../context/EntitlementsContext';
import { colors, spacing } from '../theme';

const AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-1580761947831808/1129971883',
  ios: 'ca-app-pub-1580761947831808/1129971883',
  default: ''
});

// The native module is missing in Expo Go and on builds made without the
// config plugin. Requiring it inside try/catch keeps the app from crashing
// in those cases; the banner simply never shows.
let GoogleMobileAds: typeof import('react-native-google-mobile-ads') | null = null;
try {
  GoogleMobileAds = require('react-native-google-mobile-ads');
} catch (e) {
  console.log('Google Mobile Ads not available:', e);
}

let sdkInit: Promise<unknown> | null = null;
const initializeAds = () => {
  if (!GoogleMobileAds) return Promise.reject(new Error('Ads unavailable'));
  if (!sdkInit) {
    sdkInit = GoogleMobileAds.default().initialize().catch((e) => {
      sdkInit = null;
      throw e;
    });
  }
  return sdkInit;
};

// Closing the banner hides it on every tab until the app is relaunched.
let dismissedThisSession = false;
const dismissListeners = new Set<() => void>();
const dismissEverywhere = () => {
  dismissedThisSession = true;
  dismissListeners.forEach((listener) => listener());
};

const HIDDEN_OFFSET = 200;

const AdBanner = () => {
  const { isPro, loading } = useEntitlements();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(dismissedThisSession);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;

  useEffect(() => {
    const listener = () => setDismissed(true);
    dismissListeners.add(listener);
    return () => {
      dismissListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (loading || isPro || dismissed) return;
    let cancelled = false;
    initializeAds()
      .then(() => !cancelled && setReady(true))
      .catch((e) => console.log('Ads failed to initialize:', e));
    return () => {
      cancelled = true;
    };
  }, [loading, isPro, dismissed]);

  useEffect(() => {
    if (!adLoaded) return;
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8
    }).start();
  }, [adLoaded, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: HIDDEN_OFFSET,
      duration: 200,
      useNativeDriver: true
    }).start(() => dismissEverywhere());
  };

  if (!GoogleMobileAds || loading || isPro || dismissed || adError || !ready) {
    return null;
  }

  const { BannerAd, BannerAdSize, TestIds } = GoogleMobileAds;
  const unitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : AD_UNIT_ID;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }, !adLoaded && styles.hidden]}
      pointerEvents={adLoaded ? 'box-none' : 'none'}
    >
      <View style={styles.banner}>
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
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={(error) => {
            console.log('Ad failed to load:', error);
            setAdError(true);
          }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  banner: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border
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
  },
  hidden: {
    opacity: 0
  }
});

export default AdBanner;
