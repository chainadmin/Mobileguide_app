import { useCallback, useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import AdBanner from '../components/AdBanner';
import BuzzMeter from '../components/BuzzMeter';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, borderRadius } from '../theme';
import { useWatchlist } from '../context/WatchlistContext';
import { useEntitlements } from '../context/EntitlementsContext';
import { useAlerts } from '../context/AlertsContext';
import { getPosterUrl } from '../services/tmdb';
import { getGuestId } from '../services/guestId';
import { useRegion } from '../context/RegionContext';

const API_BASE = 'https://welcoming-elegance-production-9299.up.railway.app';

type PodcastFollow = {
  id: number;
  title: string;
  author: string;
  image: string;
  buzzScore?: number;
};

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WatchlistScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { watchlist, removeFromWatchlist, loading, refreshWatchlist } = useWatchlist();
  const { isPro } = useEntitlements();
  const { toggleAlert, isAlertEnabled } = useAlerts();
  const { region } = useRegion();
  const [followedPodcasts, setFollowedPodcasts] = useState<PodcastFollow[]>([]);
  const [podcastBuzzScores, setPodcastBuzzScores] = useState<Record<number, number>>({});
  const [guestId, setGuestId] = useState<string | null>(null);
  const maxSlots = 10;

  useEffect(() => {
    const init = async () => {
      const id = await getGuestId();
      setGuestId(id);
    };
    init();
  }, []);

  const fetchFollowedPodcasts = useCallback(async () => {
    if (!guestId || !region) return;
    try {
      const res = await fetch(`${API_BASE}/api/podcasts/follows?guestId=${guestId}`);
      if (res.ok) {
        const data = await res.json();
        const follows = data.follows || [];
        const shows: PodcastFollow[] = follows.map((f: any) => ({
          id: f.show_id,
          title: f.title,
          author: f.author,
          image: f.image
        }));
        setFollowedPodcasts(shows);
        
        const buzzScores: Record<number, number> = {};
        await Promise.all(shows.map(async (show: PodcastFollow) => {
          try {
            const buzzRes = await fetch(`${API_BASE}/api/podcasts/buzz/show/${show.id}?region=${region.code}`);
            if (buzzRes.ok) {
              const buzzData = await buzzRes.json();
              buzzScores[show.id] = buzzData.viewCount || 0;
            }
          } catch {
            buzzScores[show.id] = 0;
          }
        }));
        setPodcastBuzzScores(buzzScores);
      }
    } catch (err) {
      console.error('Error fetching followed podcasts:', err);
    }
  }, [guestId, region]);

  const unfollowPodcast = async (showId: number) => {
    if (!guestId) return;
    try {
      const res = await fetch(`${API_BASE}/api/podcasts/follows/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, showId })
      });
      if (res.ok) {
        setFollowedPodcasts(prev => prev.filter(p => p.id !== showId));
      }
    } catch (err) {
      console.error('Error unfollowing podcast:', err);
    }
  };

  useEffect(() => {
    if (guestId) {
      fetchFollowedPodcasts();
    }
  }, [guestId, fetchFollowedPodcasts]);

  useFocusEffect(
    useCallback(() => {
      refreshWatchlist();
      if (guestId) {
        fetchFollowedPodcasts();
      }
    }, [refreshWatchlist, fetchFollowedPodcasts, guestId])
  );

  const handlePress = (item: typeof watchlist[0]) => {
    navigation.navigate('TitleDetail', {
      mediaType: item.mediaType,
      tmdbId: item.id
    });
  };

  const handleRemove = async (item: typeof watchlist[0]) => {
    await removeFromWatchlist(item.id, item.mediaType);
  };

  const handleUpgrade = () => {
    navigation.navigate('Paywall');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleToggleAlert = async (item: typeof watchlist[0]) => {
    if (!isPro) {
      navigation.navigate('Paywall');
      return;
    }
    await toggleAlert(item.id, item.mediaType);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <SectionHeader title="WATCHLIST" subtitle="Your saved lineup." />
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.planCard}>
        <View style={styles.planInfo}>
          <Text style={styles.planLabel}>{isPro ? 'Pro Plan' : 'Free Plan'}</Text>
          <View style={[styles.countPill, isPro && styles.countPillPro]}>
            <Text style={[styles.countText, isPro && styles.countTextPro]}>
              {isPro ? `${watchlist.length + followedPodcasts.length} saved` : `${watchlist.length + followedPodcasts.length}/${maxSlots}`}
            </Text>
          </View>
        </View>
        {!isPro && (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.8}>
            <Text style={styles.upgradeText}>Unlock Unlimited</Text>
          </TouchableOpacity>
        )}
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </View>

      {!isPro && watchlist.length >= maxSlots && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>You've reached the free limit</Text>
          <TouchableOpacity onPress={handleUpgrade}>
            <Text style={styles.limitLink}>Upgrade to Pro →</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPro && (
        <View style={styles.proBanner}>
          <Text style={styles.proIcon}>🔔</Text>
          <Text style={styles.proBannerText}>Tap the bell to get release alerts</Text>
        </View>
      )}

      {watchlist.length === 0 && followedPodcasts.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          message="Save movies, shows, and podcasts to keep track of what to watch and listen to."
        />
      ) : (
        <>
          {watchlist.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>MOVIES & SHOWS</Text>
            </View>
          )}
          {watchlist.map((item) => {
          const alertOn = isAlertEnabled(item.id, item.mediaType);
          return (
            <TouchableOpacity
              key={`${item.mediaType}-${item.id}`}
              style={styles.card}
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: getPosterUrl(item.posterPath, 'w185') }}
                style={styles.poster}
              />
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.type}>{item.mediaType === 'movie' ? 'Movie' : 'TV Series'}</Text>
              </View>
              <View style={styles.cardActions}>
                {isPro && (
                  <TouchableOpacity
                    style={[styles.alertButton, alertOn && styles.alertButtonActive]}
                    onPress={() => handleToggleAlert(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.alertIcon}>{alertOn ? '🔔' : '🔕'}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
          })}

          {followedPodcasts.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>PODCASTS</Text>
            </View>
          )}
          {followedPodcasts.map((podcast) => (
            <View key={`podcast-${podcast.id}`} style={styles.podcastCard}>
              <TouchableOpacity
                style={styles.podcastCardContent}
                onPress={() => navigation.navigate('PodcastShowDetail', { showId: podcast.id })}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: podcast.image }}
                  style={styles.poster}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={2}>{stripHtml(podcast.title)}</Text>
                  <Text style={styles.type}>Podcast</Text>
                  <BuzzMeter value={podcastBuzzScores[podcast.id] || 0} />
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => unfollowPodcast(podcast.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.removeText}>Unfollow</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  settingsButton: {
    padding: spacing.sm
  },
  settingsIcon: {
    fontSize: 20
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  planLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.chipBackground,
    borderWidth: 1,
    borderColor: colors.chipBorder
  },
  countPillPro: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent + '40'
  },
  countText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  countTextPro: {
    color: colors.accent
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full
  },
  upgradeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700'
  },
  proBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full
  },
  proBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  limitBanner: {
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  limitText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  limitLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600'
  },
  proBanner: {
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  proIcon: {
    fontSize: 16
  },
  proBannerText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: borderRadius.sm
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600'
  },
  type: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: spacing.sm
  },
  alertButton: {
    padding: spacing.xs,
    opacity: 0.6
  },
  alertButtonActive: {
    opacity: 1
  },
  alertIcon: {
    fontSize: 18
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  removeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600'
  },
  sectionContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  podcastCard: {
    marginBottom: spacing.sm
  },
  podcastCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  }
});

export default WatchlistScreen;
