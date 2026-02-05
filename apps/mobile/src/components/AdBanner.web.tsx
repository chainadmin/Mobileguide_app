import { StyleSheet, Text, View } from 'react-native';
import { useEntitlements } from '../context/EntitlementsContext';
import { colors, spacing } from '../theme';

const AdBanner = () => {
  const { isPro, loading } = useEntitlements();

  if (loading || isPro) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.adLabel}>AD</Text>
        <Text style={styles.adText}>Upgrade to Pro for an ad-free experience</Text>
      </View>
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
