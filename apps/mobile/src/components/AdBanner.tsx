import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useEntitlements } from '../context/EntitlementsContext';
import { colors, spacing } from '../theme';

const AD_UNIT_ID = 'ca-app-pub-1580761947831808/1129971883';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let adsAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    if (ads && ads.BannerAd && ads.BannerAdSize) {
      BannerAd = ads.BannerAd;
      BannerAdSize = ads.BannerAdSize;
      TestIds = ads.TestIds || {};
      adsAvailable = true;
    }
  } catch (e) {
    console.log('Google Mobile Ads not available (requires custom dev build)');
  }
}

const PlaceholderBanner = () => (
  <View style={styles.banner}>
    <Text style={styles.adLabel}>AD</Text>
    <Text style={styles.adText}>Upgrade to Pro for an ad-free experience</Text>
  </View>
);

const AdBanner = () => {
  const { isPro, loading } = useEntitlements();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  if (loading || isPro) {
    return null;
  }

  if (Platform.OS === 'web' || !adsAvailable || !BannerAd || !BannerAdSize) {
    return (
      <View style={styles.container}>
        <PlaceholderBanner />
      </View>
    );
  }

  const adUnitId = __DEV__ && TestIds?.BANNER ? TestIds.BANNER : AD_UNIT_ID;

  return (
    <View style={styles.container}>
      {(!adLoaded || adError) && <PlaceholderBanner />}
      {!adError && (
        <View style={adLoaded ? undefined : styles.hidden}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => setAdLoaded(true)}
            onAdFailedToLoad={(error: any) => {
              console.log('Ad failed to load:', error);
              setAdError(true);
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0
  },
  banner: {
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    minHeight: 50,
    gap: spacing.sm
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
  adText: {
    color: colors.textSecondary,
    fontSize: 12
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none'
  }
});

export default AdBanner;
