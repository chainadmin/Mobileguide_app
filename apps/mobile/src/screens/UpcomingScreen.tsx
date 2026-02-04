import { useEffect, useState, useCallback } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';
import SkeletonCard from '../components/SkeletonCard';
import { colors, spacing } from '../theme';
import { useRegion } from '../context/RegionContext';
import {
  getUpcoming,
  getWatchProviders,
  getPosterUrl,
  formatRating,
  calculateBuzz,
  TrendingItem,
  WatchProvider
} from '../services/tmdb';

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
};

type Section = {
  title: string;
  data: DisplayItem[];
};

const UpcomingScreen = () => {
  const { region } = useRegion();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!region) return;
    
    try {
      setLoading(true);
      const regionCode = region.code;
      const upcoming = await getUpcoming(regionCode);
      const items = await Promise.all(
        upcoming.slice(0, 10).map(item => transformItem(item, regionCode))
      );

      const grouped = items.reduce<Record<string, DisplayItem[]>>((acc, item) => {
        if (!acc[item.releaseDate]) {
          acc[item.releaseDate] = [];
        }
        acc[item.releaseDate].push(item);
        return acc;
      }, {});

      const sectionList = Object.entries(grouped).map(([title, data]) => ({
        title,
        data
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

  async function transformItem(item: TrendingItem, regionCode: string): Promise<DisplayItem> {
    const title = item.title || item.name || 'Unknown';
    const providers = await fetchProviders(item, regionCode);
    const releaseDate = formatReleaseDate(item.release_date || item.first_air_date);
    
    return {
      id: `movie-${item.id}`,
      title,
      tagline: item.overview.slice(0, 60) + (item.overview.length > 60 ? '...' : ''),
      rating: formatRating(item.vote_average),
      runtime: 'Movie',
      genre: 'Movie',
      posterUrl: getPosterUrl(item.poster_path),
      providers: providers.slice(0, 3),
      buzz: calculateBuzz(item.vote_average),
      releaseDate
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <SectionHeader title="UPCOMING" subtitle="Save the dates for these releases." />
          <SkeletonCard size="small" />
          <SkeletonCard size="small" />
          <SkeletonCard size="small" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeader title="UPCOMING" subtitle="Save the dates for these releases." />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.dateHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => <PosterCard {...item} size="small" />}
        contentContainerStyle={styles.container}
        stickySectionHeadersEnabled={false}
      />
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
    paddingBottom: 40
  },
  header: {
    marginBottom: spacing.sm
  },
  dateHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  }
});

export default UpcomingScreen;
