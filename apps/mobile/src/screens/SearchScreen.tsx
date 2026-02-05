import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../../App';
import { colors, spacing, borderRadius } from '../theme';
import { useRegion } from '../context/RegionContext';
import { useEntitlements } from '../context/EntitlementsContext';
import { searchContent, SearchResultItem } from '../services/api';
import { getPosterUrl, getTrending, getUpcoming, TrendingItem } from '../services/tmdb';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RECENT_SEARCHES_KEY = '@buzzreel_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region } = useRegion();
  const { isPro } = useEntitlements();
  
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedNow, setSuggestedNow] = useState<TrendingItem[]>([]);
  const [upcomingSuggestions, setUpcomingSuggestions] = useState<TrendingItem[]>([]);
  const [buzzingResults, setBuzzingResults] = useState<SearchResultItem[]>([]);
  const [upcomingResults, setUpcomingResults] = useState<SearchResultItem[]>([]);
  const [fallbackResults, setFallbackResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadRecentSearches();
    loadSuggestions();
  }, [region]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchTerm: string) => {
    try {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)]
        .slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const loadSuggestions = async () => {
    if (!region) return;
    try {
      const [trending, upcoming] = await Promise.all([
        getTrending('all', 'day'),
        getUpcoming(region.code)
      ]);
      setSuggestedNow(trending.slice(0, 5));
      setUpcomingSuggestions(upcoming.slice(0, 5));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!region || searchTerm.trim().length < 2) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const results = await searchContent(searchTerm, region.code, isPro);
      setBuzzingResults(results.buzzing);
      setUpcomingResults(results.upcoming);
      setFallbackResults(results.fallback);
      
      if (searchTerm.trim().length >= 2) {
        saveRecentSearch(searchTerm.trim());
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }, [region, isPro]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else {
        setHasSearched(false);
        setBuzzingResults([]);
        setUpcomingResults([]);
        setFallbackResults([]);
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  const handleItemPress = (item: SearchResultItem | TrendingItem) => {
    const mediaType = item.media_type || 'movie';
    navigation.navigate('TitleDetail', {
      mediaType: mediaType as 'movie' | 'tv',
      tmdbId: item.id
    });
  };

  const handleRecentSearchPress = (term: string) => {
    setQuery(term);
  };

  const renderResultItem = (
    item: SearchResultItem,
    showBuzzTag: boolean = false,
    showNotTrending: boolean = false
  ) => {
    const title = item.title || item.name || 'Unknown';
    const posterUrl = getPosterUrl(item.poster_path, 'w185');
    
    return (
      <TouchableOpacity
        key={`${item.media_type}-${item.id}`}
        style={styles.resultItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: posterUrl }} style={styles.resultPoster} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.resultMeta}>
            {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
          </Text>
          {showBuzzTag && item.isBuzzing && (
            <View style={styles.buzzTag}>
              <Text style={styles.buzzTagText}>🔥 Buzzing</Text>
            </View>
          )}
          {showNotTrending && (
            <Text style={styles.notTrendingText}>Not trending</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSuggestionItem = (item: TrendingItem, emoji: string) => {
    const title = item.title || item.name || 'Unknown';
    
    return (
      <TouchableOpacity
        key={`${item.media_type}-${item.id}`}
        style={styles.suggestionItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.suggestionEmoji}>{emoji}</Text>
        <Text style={styles.suggestionTitle} numberOfLines={1}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const showSuggestions = !hasSearched && query.length < 2;
  const hasResults = buzzingResults.length > 0 || upcomingResults.length > 0 || fallbackResults.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search what's buzzing…"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        )}

        {!loading && showSuggestions && (
          <>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => handleRecentSearchPress(term)}
                  >
                    <Text style={styles.recentBullet}>•</Text>
                    <Text style={styles.recentText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {suggestedNow.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggested Now</Text>
                {suggestedNow.map(item => renderSuggestionItem(item, '🔥'))}
              </View>
            )}

            {upcomingSuggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {upcomingSuggestions.map(item => renderSuggestionItem(item, '📅'))}
              </View>
            )}
          </>
        )}

        {!loading && hasSearched && !hasResults && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}

        {!loading && hasSearched && hasResults && (
          <>
            {buzzingResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Buzzing Now</Text>
                {buzzingResults.map(item => renderResultItem(item, true))}
              </View>
            )}

            {upcomingResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {upcomingResults.map(item => renderResultItem(item))}
              </View>
            )}

            {fallbackResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>More Results</Text>
                {fallbackResults.map(item => renderResultItem(item, false, true))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.md
  },
  clearButton: {
    padding: spacing.sm
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 16
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  loadingContainer: {
    paddingVertical: spacing.xl
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase'
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  recentBullet: {
    color: colors.textSecondary,
    fontSize: 16,
    marginRight: spacing.sm
  },
  recentText: {
    color: colors.textSecondary,
    fontSize: 15
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  suggestionEmoji: {
    fontSize: 16,
    marginRight: spacing.sm
  },
  suggestionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    flex: 1
  },
  resultItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm
  },
  resultPoster: {
    width: 60,
    height: 90,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center'
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4
  },
  resultMeta: {
    color: colors.textSecondary,
    fontSize: 13
  },
  buzzTag: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.sm
  },
  buzzTagText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600'
  },
  notTrendingText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.sm
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14
  }
});

export default SearchScreen;
