import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useEntitlements } from '../context/EntitlementsContext';
import { colors, spacing } from '../theme';

const AD_UNIT_ID = 'ca-app-pub-1580761947831808/1129971883';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
  } catch (e) {
    console.log('Google Mobile Ads not available');
  }
}

const AdBanner = () => {
  const { isPro, loading } = useEntitlements();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  if (loading || isPro) {
    return null;
  }

  if (Platform.OS === 'web' || !BannerAd) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <Text style={styles.adLabel}>AD</Text>
          <Text style={styles.adText}>Upgrade to Pro for an ad-free experience</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!adLoaded && !adError && (
        <View style={styles.banner}>
          <Text style={styles.adLabel}>AD</Text>
          <Text style={styles.adText}>Loading...</Text>
        </View>
      )}
      {adError && (
        <View style={styles.banner}>
          <Text style={styles.adLabel}>AD</Text>
          <Text style={styles.adText}>Upgrade to Pro for an ad-free experience</Text>
        </View>
      )}
      <BannerAd
        unitId={__DEV__ ? TestIds?.BANNER : AD_UNIT_ID}
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
  }
});

export default AdBanner;
