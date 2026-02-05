import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import { getGuestId } from '../services/guestId';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EpisodeDetailRouteProp = RouteProp<RootStackParamList, 'PodcastEpisodeDetail'>;

type PodcastEpisode = {
  id: number;
  showId: number;
  showTitle: string;
  showImage: string;
  title: string;
  description: string;
  datePublished: number;
  duration: number;
  audioUrl: string;
};

const API_BASE = 'https://welcoming-elegance-production-9299.up.railway.app';

const PodcastEpisodeDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EpisodeDetailRouteProp>();
  const { episodeId } = route.params;
  const { region } = useRegion();

  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEpisodeDetails();
  }, [episodeId]);

  const fetchEpisodeDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/podcasts/episode/${episodeId}`);
      
      if (res.ok) {
        const data = await res.json();
        setEpisode(data.episode);
        recordView(data.episode?.showId);
      } else {
        setError('Episode not found');
      }
    } catch (err) {
      console.error('Error fetching episode:', err);
      setError('Unable to load episode details.');
    } finally {
      setLoading(false);
    }
  };

  const recordView = async (showId?: number) => {
    try {
      const guestId = await getGuestId();
      await fetch(`${API_BASE}/api/podcasts/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          eventType: 'episode_view',
          episodeId,
          showId: showId || null,
          region: region?.code || 'US'
        })
      });
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins} min`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handlePlayExternal = () => {
    if (episode?.audioUrl) {
      Linking.openURL(episode.audioUrl);
    }
  };

  const handleViewShow = () => {
    if (episode?.showId) {
      navigation.navigate('PodcastShowDetail', { showId: episode.showId });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !episode) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Episode not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.showHeader} onPress={handleViewShow} activeOpacity={0.8}>
        <Image source={{ uri: episode.showImage }} style={styles.showImage} />
        <View style={styles.showInfo}>
          <Text style={styles.showTitle} numberOfLines={1}>{episode.showTitle}</Text>
          <Text style={styles.viewShowText}>View Show</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.episodeTitle}>{episode.title}</Text>
      
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatDate(episode.datePublished)}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{formatDuration(episode.duration)}</Text>
      </View>

      {episode.audioUrl && (
        <TouchableOpacity style={styles.playButton} onPress={handlePlayExternal} activeOpacity={0.8}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.playButtonText}>Listen in Podcast App</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>About this Episode</Text>
      <Text style={styles.description}>{episode.description}</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md
  },
  backButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600'
  },
  showHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  showImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton
  },
  showInfo: {
    flex: 1,
    gap: 2
  },
  showTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  viewShowText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '500'
  },
  episodeTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: spacing.sm
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 10
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.xl
  },
  playIcon: {
    color: colors.background,
    fontSize: 14
  },
  playButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600'
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});

export default PodcastEpisodeDetailScreen;
