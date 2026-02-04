import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { colors, spacing, borderRadius } from '../theme';
import BuzzMeter from '../components/BuzzMeter';
import ProviderChips from '../components/ProviderChips';
import {
  getMovieDetails,
  getTVDetails,
  getWatchProviders,
  getPosterUrl,
  getBackdropUrl,
  formatRuntime,
  formatRating,
  MovieDetails,
  TVDetails,
  WatchProvider
} from '../services/tmdb';
import { getBuzzCount, voteBuzz } from '../services/api';

type TitleDetailRouteProp = RouteProp<RootStackParamList, 'TitleDetail'>;

const TitleDetailScreen = () => {
  const route = useRoute<TitleDetailRouteProp>();
  const { mediaType, tmdbId } = route.params;

  const [details, setDetails] = useState<MovieDetails | TVDetails | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [buzzCount, setBuzzCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [detailsData, providersData, buzzData] = await Promise.all([
          mediaType === 'movie' ? getMovieDetails(tmdbId) : getTVDetails(tmdbId),
          getWatchProviders(mediaType, tmdbId),
          getBuzzCount(mediaType, tmdbId)
        ]);
        setDetails(detailsData);
        setBuzzCount(buzzData);
        if (providersData?.flatrate) {
          setProviders(providersData.flatrate.map((p: WatchProvider) => p.provider_name));
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [mediaType, tmdbId]);

  const handleBuzzVote = async () => {
    const newCount = await voteBuzz(mediaType, tmdbId);
    setBuzzCount(newCount);
  };

  if (loading || !details) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const title = 'title' in details ? details.title : details.name;
  const releaseDate = 'release_date' in details ? details.release_date : details.first_air_date;
  const runtime = 'runtime' in details 
    ? formatRuntime(details.runtime) 
    : details.episode_run_time[0] 
      ? formatRuntime(details.episode_run_time[0]) 
      : 'N/A';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {details.backdrop_path && (
        <Image
          source={{ uri: getBackdropUrl(details.backdrop_path) }}
          style={styles.backdrop}
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: getPosterUrl(details.poster_path, 'w342') }}
            style={styles.poster}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.tagline}>{details.tagline || 'No tagline available'}</Text>
            <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{formatRating(details.vote_average)}</Text>
              </View>
              <Text style={styles.metaText}>{runtime}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{releaseDate?.split('-')[0] || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.genresRow}>
          {details.genres.slice(0, 3).map(genre => (
            <View key={genre.id} style={styles.genreChip}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <BuzzMeter value={buzzCount} onPress={handleBuzzVote} showVoteHint={true} />

        <Text style={styles.sectionTitle}>WHERE TO WATCH</Text>
        {providers.length > 0 ? (
          <ProviderChips providers={providers} />
        ) : (
          <Text style={styles.noProviders}>No streaming options available</Text>
        )}

        <Text style={styles.sectionTitle}>OVERVIEW</Text>
        <Text style={styles.overview}>{details.overview || 'No overview available.'}</Text>
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
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16
  },
  backdrop: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  content: {
    padding: spacing.lg
  },
  header: {
    flexDirection: 'row',
    marginTop: -60
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.background
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'flex-end'
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700'
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: spacing.xs
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm
  },
  ratingBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm
  },
  ratingText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700'
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 13
  },
  metaDot: {
    color: colors.textMuted,
    marginHorizontal: spacing.xs
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    gap: spacing.sm
  },
  genreChip: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full
  },
  genreText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  noProviders: {
    color: colors.textSecondary,
    fontSize: 13
  },
  overview: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
  }
});

export default TitleDetailScreen;
