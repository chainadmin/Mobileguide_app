import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const TMDB_LOGO_URL = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg';

const SettingsScreen = () => {
  const openTMDB = () => {
    Linking.openURL('https://www.themoviedb.org/');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
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
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkRowText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
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
