import { useEffect, useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import AdBanner from '../components/AdBanner';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import { useEntitlements } from '../context/EntitlementsContext';
import { getGuestId } from '../services/guestId';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PodcastShow = {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  buzzScore?: number;
};

type PodcastEpisode = {
  id: number;
  showId: number;
  showTitle: string;
  title: string;
  image: string;
  datePublished: number;
  duration: number;
  isFollowing?: boolean;
};

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const API_BASE = 'https://welcoming-elegance-production-9299.up.railway.app';

const PodcastsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region } = useRegion();
  const { isPro } = useEntitlements();
  const [buzzingNow, setBuzzingNow] = useState<PodcastShow[]>([]);
  const [newDrops, setNewDrops] = useState<PodcastEpisode[]>([]);
  const [topInRegion, setTopInRegion] = useState<PodcastShow[]>([]);
  const [followingShows, setFollowingShows] = useState<PodcastShow[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const id = await getGuestId();
      setGuestId(id);
    };
    init();
  }, []);

  const fetchPodcasts = useCallback(async () => {
    if (!region || !guestId) return;
    
    try {
      setLoading(true);
      setError(null);
      const regionCode = region.code;
      
      const [buzzRes, newRes, topRes, followsRes] = await Promise.all([
        fetch(`${API_BASE}/api/podcasts/buzz?region=${regionCode}`),
        fetch(`${API_BASE}/api/podcasts/new?region=${regionCode}`),
        fetch(`${API_BASE}/api/podcasts/top?region=${regionCode}`),
        fetch(`${API_BASE}/api/podcasts/follows?guestId=${guestId}`)
      ]);

      if (buzzRes.ok) {
        const buzzData = await buzzRes.json();
        setBuzzingNow(buzzData.shows || []);
      }

      if (newRes.ok) {
        const newData = await newRes.json();
        setNewDrops(newData.episodes || []);
      }

      if (topRes.ok) {
        const topData = await topRes.json();
        setTopInRegion(topData.shows || []);
      }

      if (followsRes.ok) {
        const followsData = await followsRes.json();
        const shows = followsData.shows || [];
        setFollowingShows(shows);
        setFollowingIds(new Set(shows.map((s: PodcastShow) => s.id)));
      }
    } catch (err) {
      console.error('Error fetching podcasts:', err);
      setError('Unable to load podcasts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [region, guestId]);

  useFocusEffect(
    useCallback(() => {
      fetchPodcasts();
    }, [fetchPodcasts])
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderShowCard = (show: PodcastShow, showFollowBadge = false) => (
    <TouchableOpacity
      key={show.id}
      style={styles.showCard}
      onPress={() => navigation.navigate('PodcastShowDetail', { showId: show.id })}
      activeOpacity={0.8}
    >
      <View style={styles.showImageContainer}>
        <Image source={{ uri: show.image }} style={styles.showImage} />
        {show.buzzScore !== undefined && show.buzzScore > 0 && (
          <View style={styles.buzzBadge}>
            <Text style={styles.buzzBadgeText}>🔥 {show.buzzScore}</Text>
          </View>
        )}
        {(showFollowBadge || followingIds.has(show.id)) && (
          <View style={styles.followingBadge}>
            <Text style={styles.followingBadgeText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.showInfo}>
        <Text style={styles.showTitle} numberOfLines={2}>{stripHtml(show.title)}</Text>
        <Text style={styles.showAuthor} numberOfLines={1}>{stripHtml(show.author)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEpisodeCard = (episode: PodcastEpisode) => {
    const isShowFollowed = followingIds.has(episode.showId);
    return (
      <TouchableOpacity
        key={episode.id}
        style={styles.episodeCard}
        onPress={() => navigation.navigate('PodcastEpisodeDetail', { episodeId: episode.id })}
        activeOpacity={0.8}
      >
        <View style={styles.episodeImageContainer}>
          <Image source={{ uri: episode.image }} style={styles.episodeImage} />
          {isShowFollowed && (
            <View style={styles.episodeFollowBadge}>
              <Text style={styles.episodeFollowBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.episodeInfo}>
          <View style={styles.episodeShowRow}>
            <Text style={styles.episodeShowTitle} numberOfLines={1}>{stripHtml(episode.showTitle)}</Text>
            {isShowFollowed && <Text style={styles.followingLabel}>Following</Text>}
          </View>
          <Text style={styles.episodeTitle} numberOfLines={2}>{stripHtml(episode.title)}</Text>
          <View style={styles.episodeMeta}>
            <Text style={styles.episodeMetaText}>{formatDate(episode.datePublished)}</Text>
            <Text style={styles.episodeMetaDot}>•</Text>
            <Text style={styles.episodeMetaText}>{formatDuration(episode.duration)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHorizontalShows = (shows: PodcastShow[], title: string, subtitle: string, showFollowBadges = false) => (
    <>
      <SectionHeader title={title} subtitle={subtitle} />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={[styles.horizontalScroll, Platform.OS === 'web' && { overflow: 'hidden' as const }]}
        contentContainerStyle={styles.horizontalContainer}
      >
        {shows.map(show => renderShowCard(show, showFollowBadges))}
      </ScrollView>
    </>
  );

  if (loading && buzzingNow.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading podcasts...</Text>
      </View>
    );
  }

  if (error && buzzingNow.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🎙️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPodcasts}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.regionBadge} 
          onPress={() => navigation.navigate('RegionSelect')}
          activeOpacity={0.7}
        >
          <Text style={styles.regionText}>{region?.name || 'Select Region'}</Text>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {followingShows.length > 0 && renderHorizontalShows(
        followingShows,
        'YOUR SHOWS',
        'Podcasts you follow.',
        true
      )}

      {buzzingNow.length > 0 && renderHorizontalShows(
        buzzingNow, 
        `BUZZING IN ${region?.code === 'US' ? 'AMERICA' : region?.code === 'GB' ? 'THE UK' : region?.code === 'CA' ? 'CANADA' : region?.name?.toUpperCase() || 'YOUR AREA'}`, 
        'What everyone is listening to near you.'
      )}

      {newDrops.length > 0 && (
        <>
          <SectionHeader title="NEW DROPS" subtitle="Fresh episodes from the last 72 hours." />
          <View style={styles.episodeList}>
            {newDrops.slice(0, 5).map(renderEpisodeCard)}
          </View>
        </>
      )}

      {topInRegion.length > 0 && renderHorizontalShows(
        topInRegion,
        `TOP PODCASTS IN ${region?.code === 'US' ? 'AMERICA' : region?.code === 'GB' ? 'THE UK' : region?.code === 'CA' ? 'CANADA' : region?.name?.toUpperCase() || 'YOUR AREA'}`,
        'Most popular shows near you.'
      )}

      {buzzingNow.length === 0 && newDrops.length === 0 && topInRegion.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎙️</Text>
          <Text style={styles.emptyTitle}>No podcasts yet</Text>
          <Text style={styles.emptyText}>Podcasts are coming soon to your region.</Text>
        </View>
      )}
    </ScrollView>
    <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 90
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md
  },
  retryText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  regionBadge: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  regionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  changeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600'
  },
  horizontalScroll: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.xl
  },
  horizontalContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  showCard: {
    width: 140,
    gap: spacing.sm
  },
  showImageContainer: {
    position: 'relative'
  },
  showImage: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.md,
    backgroundColor: colors.skeleton
  },
  buzzBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.sm
  },
  buzzBadgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700'
  },
  followingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  followingBadgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700'
  },
  showInfo: {
    gap: 2
  },
  showTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18
  },
  showAuthor: {
    color: colors.textSecondary,
    fontSize: 12
  },
  episodeList: {
    gap: spacing.md,
    marginBottom: spacing.xl
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  episodeImageContainer: {
    position: 'relative'
  },
  episodeImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.skeleton
  },
  episodeFollowBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  episodeFollowBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700'
  },
  episodeInfo: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
    gap: 4
  },
  episodeShowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  episodeShowTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1
  },
  followingLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm
  },
  episodeTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  episodeMetaText: {
    color: colors.textSecondary,
    fontSize: 12
  },
  episodeMetaDot: {
    color: colors.textMuted,
    fontSize: 10
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center'
  }
});

export default PodcastsScreen;
