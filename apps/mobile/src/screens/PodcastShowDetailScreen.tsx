import { useEffect, useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import { useEntitlements } from '../context/EntitlementsContext';
import { getGuestId } from '../services/guestId';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ShowDetailRouteProp = RouteProp<RootStackParamList, 'PodcastShowDetail'>;

type PodcastShow = {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  language: string;
  episodeCount: number;
};

type PodcastEpisode = {
  id: number;
  title: string;
  description: string;
  datePublished: number;
  duration: number;
};

const API_BASE = 'https://welcoming-elegance-production-9299.up.railway.app';

const PodcastShowDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ShowDetailRouteProp>();
  const { showId } = route.params;
  const { region } = useRegion();
  const { isPro } = useEntitlements();

  const [show, setShow] = useState<PodcastShow | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const id = await getGuestId();
      setGuestId(id);
    };
    init();
  }, []);

  useEffect(() => {
    if (guestId) {
      fetchShowDetails();
    }
  }, [showId, guestId]);

  const fetchShowDetails = async () => {
    if (!guestId) return;
    
    try {
      setLoading(true);
      setError(null);

      const [showRes, episodesRes] = await Promise.all([
        fetch(`${API_BASE}/api/podcasts/show/${showId}?guestId=${guestId}`),
        fetch(`${API_BASE}/api/podcasts/show/${showId}/episodes`)
      ]);

      if (showRes.ok) {
        const showData = await showRes.json();
        setShow(showData.show);
        setIsFollowing(showData.isFollowing || false);
      } else {
        setError('Show not found');
      }

      if (episodesRes.ok) {
        const episodesData = await episodesRes.json();
        setEpisodes(episodesData.episodes || []);
      }
    } catch (err) {
      console.error('Error fetching show:', err);
      setError('Unable to load show details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!show || !guestId) return;
    
    setFollowLoading(true);
    try {
      const endpoint = isFollowing 
        ? `${API_BASE}/api/podcasts/follows/remove`
        : `${API_BASE}/api/podcasts/follows/add`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guestId, 
          showId: show.id, 
          region: region?.code || 'US',
          isPro 
        })
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else if (res.status === 403) {
        navigation.navigate('Paywall');
      }
    } catch (err) {
      console.error('Error following show:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Show not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: show.image }} style={styles.showImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.showTitle}>{show.title}</Text>
          <Text style={styles.showAuthor}>{show.author}</Text>
          <Text style={styles.showMeta}>
            {show.episodeCount} episodes • {show.language?.toUpperCase() || 'EN'}
          </Text>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
            disabled={followLoading}
            activeOpacity={0.8}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? colors.accent : colors.background} />
            ) : (
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>{show.description}</Text>

      <Text style={styles.sectionTitle}>Episodes</Text>
      
      {episodes.length === 0 ? (
        <Text style={styles.noEpisodes}>No episodes available</Text>
      ) : (
        <View style={styles.episodeList}>
          {episodes.map((episode) => (
            <TouchableOpacity
              key={episode.id}
              style={styles.episodeCard}
              onPress={() => navigation.navigate('PodcastEpisodeDetail', { episodeId: episode.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.episodeTitle} numberOfLines={2}>{episode.title}</Text>
              <Text style={styles.episodeDescription} numberOfLines={2}>{episode.description}</Text>
              <View style={styles.episodeMeta}>
                <Text style={styles.episodeMetaText}>{formatDate(episode.datePublished)}</Text>
                <Text style={styles.episodeMetaDot}>•</Text>
                <Text style={styles.episodeMetaText}>{formatDuration(episode.duration)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  showImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.skeleton
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4
  },
  showTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22
  },
  showAuthor: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600'
  },
  showMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  followButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    minWidth: 90,
    alignItems: 'center'
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent
  },
  followButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '600'
  },
  followingButtonText: {
    color: colors.accent
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xl
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  noEpisodes: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.xl
  },
  episodeList: {
    gap: spacing.md
  },
  episodeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6
  },
  episodeTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20
  },
  episodeDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  episodeMetaText: {
    color: colors.textMuted,
    fontSize: 12
  },
  episodeMetaDot: {
    color: colors.textMuted,
    fontSize: 10
  }
});

export default PodcastShowDetailScreen;
