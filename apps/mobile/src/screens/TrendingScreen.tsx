import { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';
import SkeletonCard from '../components/SkeletonCard';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import {
  getTrending,
  getWatchProviders,
  getPosterUrl,
  formatRating,
  calculateBuzz,
  TrendingItem,
  WatchProvider
} from '../services/tmdb';
import { getTopBuzz } from '../services/api';

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

const TrendingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region } = useRegion();
  const [tonightPicks, setTonightPicks] = useState<DisplayItem[]>([]);
  const [trendingNearYou, setTrendingNearYou] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!region) return;
    
    try {
      setLoading(true);
      const regionCode = region.code;
      
      const [dayTrending, topBuzz] = await Promise.all([
        getTrending('all', 'day'),
        getTopBuzz(regionCode)
      ]);

      const buzzMap = new Map(topBuzz.map(b => [`${b.media_type}-${b.tmdb_id}`, b.view_count]));

      const tonightItems = await Promise.all(
        dayTrending.slice(0, 2).map(item => transformItem(item, buzzMap, regionCode))
      );
      setTonightPicks(tonightItems);

      const nearYouItems = await Promise.all(
        dayTrending.slice(2, 7).map(item => transformItem(item, buzzMap, regionCode))
      );
      setTrendingNearYou(nearYouItems);
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  }, [region]);

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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        style={styles.regionBadge} 
        onPress={() => navigation.navigate('RegionSelect')}
        activeOpacity={0.7}
      >
        <Text style={styles.regionText}>{region?.name || 'Select Region'}</Text>
        <Text style={styles.changeText}>Change</Text>
      </TouchableOpacity>

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

      <SectionHeader title={`TRENDING IN ${region?.name?.toUpperCase() || 'YOUR AREA'}`} subtitle="Fresh buzz in your region right now." />
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
  regionBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
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
  section: {
    marginBottom: 28
  }
});

export default TrendingScreen;
