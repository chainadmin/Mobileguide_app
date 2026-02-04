import { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, borderRadius } from '../theme';
import { useWatchlist } from '../context/WatchlistContext';
import { getPosterUrl } from '../services/tmdb';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WatchlistScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const maxSlots = 10;

  useFocusEffect(
    useCallback(() => {
    }, [])
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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <SectionHeader title="WATCHLIST" subtitle="Your saved lineup." />
      <View style={styles.countRow}>
        <Text style={styles.countLabel}>Free plan</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{watchlist.length}/{maxSlots}</Text>
        </View>
      </View>

      {watchlist.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          message="Save titles to keep track of what to watch next."
        />
      ) : (
        watchlist.map((item) => (
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
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
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
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  countLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  countText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
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
  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  removeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600'
  }
});

export default WatchlistScreen;
