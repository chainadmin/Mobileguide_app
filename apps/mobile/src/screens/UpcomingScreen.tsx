import { useState, useCallback } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';

import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';
import SkeletonCard from '../components/SkeletonCard';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import {
  getUpcoming,
  getWatchProviders,
  getPosterUrl,
  formatRating,
  TrendingItem,
  WatchProvider
} from '../services/tmdb';
import { getBuzzCount } from '../services/api';

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
  releaseDate: string;
  rawDate: string;
};

type Section = {
  title: string;
  isToday: boolean;
  data: DisplayItem[];
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UpcomingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region } = useRegion();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!region) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const regionCode = region.code;
      const upcoming = await getUpcoming(regionCode);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      const filtered = upcoming.filter(item => {
        const dateStr = item.release_date || item.first_air_date;
        if (!dateStr) return false;
        const releaseDate = new Date(dateStr);
        if (isNaN(releaseDate.getTime())) return false;
        return releaseDate >= today && releaseDate <= twoWeeksLater;
      });

      const items = await Promise.all(
        filtered.slice(0, 15).map(item => transformItem(item, regionCode, today))
      );

      const grouped = items.reduce<Record<string, { items: DisplayItem[], isToday: boolean }>>((acc, item) => {
        if (!acc[item.releaseDate]) {
          const itemDate = new Date(item.rawDate);
          const isToday = itemDate.getTime() === today.getTime();
          acc[item.releaseDate] = { items: [], isToday };
        }
        acc[item.releaseDate].items.push(item);
        return acc;
      }, {});

      const sectionList: Section[] = Object.entries(grouped)
        .sort((a, b) => {
          const dateA = new Date(a[1].items[0].rawDate);
          const dateB = new Date(b[1].items[0].rawDate);
          return dateA.getTime() - dateB.getTime();
        })
        .map(([title, { items, isToday }]) => ({
          title: isToday ? 'DROPS TODAY' : title,
          isToday,
          data: items
        }));

      setSections(sectionList);
    } catch (error) {
      console.error('Error fetching upcoming data:', error);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  async function transformItem(item: TrendingItem, regionCode: string, today: Date): Promise<DisplayItem> {
    const title = item.title || item.name || 'Unknown';
    const [providers, buzz] = await Promise.all([
      fetchProviders(item, regionCode),
      getBuzzCount(regionCode, 'movie', item.id)
    ]);
    const rawDate = item.release_date || item.first_air_date || '';
    const releaseDate = formatReleaseDate(rawDate);
    
    return {
      id: `movie-${item.id}`,
      title,
      tagline: item.overview.slice(0, 60) + (item.overview.length > 60 ? '...' : ''),
      rating: formatRating(item.vote_average),
      runtime: 'Movie',
      genre: 'Movie',
      posterUrl: getPosterUrl(item.poster_path),
      providers: providers.slice(0, 3),
      buzz,
      releaseDate,
      rawDate
    };
  }

  async function fetchProviders(item: TrendingItem, regionCode: string): Promise<string[]> {
    try {
      const data = await getWatchProviders('movie', item.id, regionCode);
      if (data?.flatrate) {
        return data.flatrate.map((p: WatchProvider) => p.provider_name);
      }
      return [];
    } catch {
      return [];
    }
  }

  function formatReleaseDate(dateStr?: string): string {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  if (!region && !loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.container}>
          <SectionHeader title="UPCOMING" subtitle="Next 14 days of releases." />
          <TouchableOpacity
            style={styles.noRegionBanner}
            onPress={() => navigation.navigate('RegionSelect')}
            activeOpacity={0.8}
          >
            <Text style={styles.noRegionIcon}>📍</Text>
            <View style={styles.noRegionText}>
              <Text style={styles.noRegionTitle}>Set your region to see content</Text>
              <Text style={styles.noRegionSub}>Tap here to choose your country</Text>
            </View>
            <Text style={styles.noRegionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.container}>
          <SectionHeader title="UPCOMING" subtitle="Next 14 days of releases." />
          <SkeletonCard size="small" />
          <SkeletonCard size="small" />
          <SkeletonCard size="small" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <SectionHeader title="UPCOMING" subtitle="Next 14 days of releases." />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={[
            styles.dateHeaderContainer,
            section.isToday && styles.todayHeaderContainer
          ]}>
            <Text style={[
              styles.dateHeader,
              section.isToday && styles.todayHeader
            ]}>
              {section.title}
            </Text>
            {section.isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>NEW</Text>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => <PosterCard {...item} size="small" />}
        contentContainerStyle={styles.container}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming releases in the next 14 days</Text>
          </View>
        }
      />

    </SafeAreaView>
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm
  },
  settingsButton: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  settingsIcon: {
    fontSize: 18
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md
  },
  todayHeaderContainer: {
    backgroundColor: colors.accent + '15',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm
  },
  dateHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase'
  },
  todayHeader: {
    color: colors.accent
  },
  todayBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginLeft: spacing.sm
  },
  todayBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14
  },
  noRegionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    gap: spacing.sm
  },
  noRegionIcon: {
    fontSize: 22
  },
  noRegionText: {
    flex: 1
  },
  noRegionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  noRegionSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  noRegionArrow: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700'
  }
});

export default UpcomingScreen;
