import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TMDB_LOGO_URL = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg';

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region } = useRegion();

  const openTMDB = () => {
    Linking.openURL('https://www.themoviedb.org/');
  };

  const handleChangeRegion = () => {
    navigation.navigate('RegionSelect');
  };

  const handleGoPro = () => {
    navigation.navigate('Paywall');
  };

  const handleRestore = () => {
    console.log('Restore purchases');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
        <View style={styles.card}>
          <View style={styles.planRow}>
            <View>
              <Text style={styles.planLabel}>Current Plan</Text>
              <Text style={styles.planValue}>Free</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleGoPro} activeOpacity={0.8}>
              <Text style={styles.upgradeText}>Go Pro</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} onPress={handleRestore}>
            <Text style={styles.linkRowText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleChangeRegion} activeOpacity={0.7}>
            <View>
              <Text style={styles.settingLabel}>Region</Text>
              <Text style={styles.settingValue}>{region?.name || 'Not set'}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} onPress={handleGoPro} activeOpacity={0.7}>
            <View>
              <Text style={styles.settingLabel}>Platform Filters</Text>
              <Text style={styles.settingValueMuted}>Pro feature</Text>
            </View>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Buzzreel</Text>
          <Text style={styles.cardText}>
            Discover trending movies and TV shows, track upcoming releases, and manage your personal watchlist.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA ATTRIBUTION</Text>
        <TouchableOpacity style={styles.card} onPress={openTMDB} activeOpacity={0.8}>
          <View style={styles.tmdbRow}>
            <Image
              source={{ uri: TMDB_LOGO_URL }}
              style={styles.tmdbLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.cardText}>
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </Text>
          <Text style={styles.linkText}>Visit TMDB →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CREDITS</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Movie and TV show data, including images, are provided by The Movie Database (TMDB).
          </Text>
          <Text style={styles.cardText}>
            Streaming provider information courtesy of JustWatch via TMDB API.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://buzzreel.app/privacy')}>
            <Text style={styles.linkRowText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://buzzreel.app/terms')}>
            <Text style={styles.linkRowText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  section: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  version: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  planLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2
  },
  planValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full
  },
  upgradeText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 2
  },
  settingValue: {
    color: colors.textSecondary,
    fontSize: 13
  },
  settingValueMuted: {
    color: colors.textMuted,
    fontSize: 13
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '300'
  },
  proBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs
  },
  proBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  tmdbRow: {
    marginBottom: spacing.md
  },
  tmdbLogo: {
    width: 120,
    height: 24
  },
  linkText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs
  },
  linkRow: {
    paddingVertical: spacing.sm
  },
  linkRowText: {
    color: colors.textPrimary,
    fontSize: 15
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  }
});

export default SettingsScreen;
