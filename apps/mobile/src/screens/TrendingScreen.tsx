import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';
import SkeletonCard from '../components/SkeletonCard';
import { colors, spacing } from '../theme';
import {
  getTrending,
  getWatchProviders,
  getPosterUrl,
  formatRuntime,
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
};

const TrendingScreen = () => {
  const [tonightPicks, setTonightPicks] = useState<DisplayItem[]>([]);
  const [trendingNearYou, setTrendingNearYou] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dayTrending, weekTrending] = await Promise.all([
          getTrending('all', 'day'),
          getTrending('all', 'week')
        ]);

        const tonightItems = await Promise.all(
          dayTrending.slice(0, 2).map(item => transformItem(item))
        );
        setTonightPicks(tonightItems);

        const weekFiltered = weekTrending.filter(
          w => !dayTrending.slice(0, 2).some(d => d.id === w.id)
        );
        const nearYouItems = await Promise.all(
          weekFiltered.slice(0, 5).map(item => transformItem(item))
        );
        setTrendingNearYou(nearYouItems);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function transformItem(item: TrendingItem): Promise<DisplayItem> {
    const title = item.title || item.name || 'Unknown';
    const providers = await fetchProviders(item);
    
    return {
      id: `${item.media_type}-${item.id}`,
      title,
      tagline: item.overview.slice(0, 60) + (item.overview.length > 60 ? '...' : ''),
      rating: formatRating(item.vote_average),
      runtime: item.media_type === 'movie' ? 'Movie' : 'TV Series',
      genre: item.media_type === 'movie' ? 'Movie' : 'TV',
      posterUrl: getPosterUrl(item.poster_path),
      providers: providers.slice(0, 3),
      buzz: calculateBuzz(item.vote_average)
    };
  }

  async function fetchProviders(item: TrendingItem): Promise<string[]> {
    try {
      const data = await getWatchProviders(item.media_type, item.id);
      if (data?.flatrate) {
        return data.flatrate.map((p: WatchProvider) => p.provider_name);
      }
      return [];
    } catch {
      return [];
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
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

      <SectionHeader title="TRENDING NEAR YOU" subtitle="Fresh buzz in your city right now." />
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
    marginBottom: 28
  }
});

export default TrendingScreen;
