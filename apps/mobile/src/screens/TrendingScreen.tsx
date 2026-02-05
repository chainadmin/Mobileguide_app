import { useEffect, useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import AdBanner from '../components/AdBanner';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';
import SkeletonCard from '../components/SkeletonCard';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import { usePlatformFilters, STREAMING_PLATFORMS } from '../context/PlatformFiltersContext';
import { useEntitlements } from '../context/EntitlementsContext';
import {
  getRegionalContent,
  getNewThisWeek,
  getTrending,
  getWatchProviders,
  getPosterUrl,
  formatRating,
  calculateBuzz,
  TrendingItem,
  WatchProvider
} from '../services/tmdb';
import { getTopBuzz } from '../services/api';
import { recordAppOpen, getStreak } from '../services/streak';
import { getCached, setCache } from '../services/cache';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DisplayItem = {
  id: string;
  title: string;
  tagline: string;
  rating: string;
  runtime: string;
  genre: string;
  posterUrl: string;
  providers: string[];
  buzz: number;
};

type DigestItem = {
  id: number;
  title: string;
  posterUrl: string;
  mediaType: 'movie' | 'tv';
};

const DIGEST_CACHE_KEY = 'daily_digest';

const TrendingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region } = useRegion();
  const { isPro } = useEntitlements();
  const { selectedPlatforms, isEnabled: filtersEnabled } = usePlatformFilters();
  const [tonightPicks, setTonightPicks] = useState<DisplayItem[]>([]);
  const [trendingNearYou, setTrendingNearYou] = useState<DisplayItem[]>([]);
  const [top10Today, setTop10Today] = useState<DigestItem[]>([]);
  const [newThisWeek, setNewThisWeek] = useState<DigestItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const activeProviderIds = isPro && filtersEnabled && selectedPlatforms.length > 0 
    ? selectedPlatforms 
    : undefined;

  useEffect(() => {
    async function initStreak() {
      const currentStreak = await recordAppOpen();
      setStreak(currentStreak);
    }
    initStreak();
  }, []);

  const fetchData = useCallback(async () => {
    if (!region) return;
    
    try {
      setLoading(true);
      const regionCode = region.code;
      
      const cachedDigest = await getCached<{ top10: DigestItem[]; newWeek: DigestItem[] }>(
        `${DIGEST_CACHE_KEY}_${regionCode}`
      );

      if (cachedDigest && !activeProviderIds) {
        setTop10Today(cachedDigest.top10);
        setNewThisWeek(cachedDigest.newWeek);
      }

      const [regionalContent, topBuzz, trendingToday, recentReleases] = await Promise.all([
        getRegionalContent(regionCode, activeProviderIds),
        getTopBuzz(regionCode),
        getTrending('all', 'day'),
        getNewThisWeek(regionCode)
      ]);

      const buzzMap = new Map(topBuzz.map(b => [`${b.media_type}-${b.tmdb_id}`, b.view_count]));

      const top10Items: DigestItem[] = trendingToday.slice(0, 10).map(item => ({
        id: item.id,
        title: item.title || item.name || '',
        posterUrl: getPosterUrl(item.poster_path, 'w185'),
        mediaType: item.media_type
      }));
      setTop10Today(top10Items);

      const newWeekItems: DigestItem[] = recentReleases.map(item => ({
        id: item.id,
        title: item.title || item.name || '',
        posterUrl: getPosterUrl(item.poster_path, 'w185'),
        mediaType: 'movie' as const
      }));
      setNewThisWeek(newWeekItems);

      await setCache(`${DIGEST_CACHE_KEY}_${regionCode}`, { top10: top10Items, newWeek: newWeekItems });

      const tonightItems = await Promise.all(
        regionalContent.slice(0, 2).map(item => transformItem(item, buzzMap, regionCode))
      );
      setTonightPicks(tonightItems);

      const nearYouItems = await Promise.all(
        regionalContent.slice(2, 7).map(item => transformItem(item, buzzMap, regionCode))
      );
      setTrendingNearYou(nearYouItems);
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  }, [region, activeProviderIds]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  async function transformItem(
    item: TrendingItem, 
    buzzMap: Map<string, number>,
    regionCode: string
  ): Promise<DisplayItem> {
    const title = item.title || item.name || 'Unknown';
    const providers = await fetchProviders(item, regionCode);
    const buzzKey = `${item.media_type}-${item.id}`;
    const buzz = buzzMap.get(buzzKey) || calculateBuzz(item.vote_average);
    
    return {
      id: buzzKey,
      title,
      tagline: item.overview.slice(0, 60) + (item.overview.length > 60 ? '...' : ''),
      rating: formatRating(item.vote_average),
      runtime: item.media_type === 'movie' ? 'Movie' : 'TV Series',
      genre: item.media_type === 'movie' ? 'Movie' : 'TV',
      posterUrl: getPosterUrl(item.poster_path),
      providers: providers.slice(0, 3),
      buzz
    };
  }

  async function fetchProviders(item: TrendingItem, regionCode: string): Promise<string[]> {
    try {
      const data = await getWatchProviders(item.media_type, item.id, regionCode);
      if (data?.flatrate) {
        return data.flatrate.map((p: WatchProvider) => p.provider_name);
      }
      return [];
    } catch {
      return [];
    }
  }

  const renderDigestStrip = (items: DigestItem[], title: string, subtitle: string) => (
    <>
      <SectionHeader title={title} subtitle={subtitle} />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.digestScroll}
        contentContainerStyle={styles.digestContainer}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.digestItem}
            onPress={() => navigation.navigate('TitleDetail', { 
              mediaType: item.mediaType, 
              tmdbId: item.id 
            })}
            activeOpacity={0.8}
          >
            <View style={styles.digestPosterContainer}>
              <Image source={{ uri: item.posterUrl }} style={styles.digestPoster} />
              {title === 'TOP 10 TODAY' && (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
              )}
            </View>
            <Text style={styles.digestTitle} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

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
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>{streak} day{streak !== 1 ? 's' : ''}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {activeProviderIds && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterIcon}>📺</Text>
          <Text style={styles.filterText}>
            Filtered to {selectedPlatforms.length} service{selectedPlatforms.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PlatformFilters')}>
            <Text style={styles.filterLink}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      <SectionHeader title="TONIGHT" subtitle="Top picks curated for your evening." />
      <View style={styles.section}>
        {loading ? (
          <>
            <SkeletonCard size="large" />
            <SkeletonCard size="large" />
          </>
        ) : (
          tonightPicks.map((item) => (
            <PosterCard key={item.id} {...item} size="large" />
          ))
        )}
      </View>

      <SectionHeader title={`BUZZING IN ${region?.code === 'US' ? 'AMERICA' : region?.code === 'GB' ? 'THE UK' : region?.code === 'CA' ? 'CANADA' : region?.name?.toUpperCase() || 'YOUR AREA'}`} subtitle="What everyone's watching near you." />
      <View style={styles.section}>
        {loading ? (
          <>
            <SkeletonCard size="small" />
            <SkeletonCard size="small" />
            <SkeletonCard size="small" />
          </>
        ) : (
          trendingNearYou.map((item) => (
            <PosterCard key={item.id} {...item} size="small" />
          ))
        )}
      </View>

      {renderDigestStrip(top10Today, 'TOP 10 TODAY', 'Most watched right now.')}
      
      {newThisWeek.length > 0 && renderDigestStrip(newThisWeek, 'NEW THIS WEEK', 'Fresh releases to check out.')}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: 4
  },
  streakIcon: {
    fontSize: 14
  },
  streakText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700'
  },
  searchButton: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchIcon: {
    fontSize: 18
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  filterIcon: {
    fontSize: 14
  },
  filterText: {
    flex: 1,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600'
  },
  filterLink: {
    color: colors.textSecondary,
    fontSize: 12
  },
  section: {
    marginBottom: 28
  },
  digestScroll: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.xl
  },
  digestContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  digestItem: {
    width: 100
  },
  digestPosterContainer: {
    position: 'relative'
  },
  digestPoster: {
    width: 100,
    height: 150,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton
  },
  rankBadge: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    backgroundColor: colors.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800'
  },
  digestTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center'
  }
});

export default TrendingScreen;
