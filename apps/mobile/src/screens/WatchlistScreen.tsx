import { ScrollView, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';

const watchlistItems = [
  {
    id: 'w1',
    title: 'Gilded Frequency',
    tagline: 'An audio engineer rescues a lost opera.',
    rating: '8.3',
    runtime: '1h 52m',
    genre: 'Music · Drama',
    posterUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    providers: ['Prime Video', 'Paramount+'],
    buzz: 79
  },
  {
    id: 'w2',
    title: 'City of Comets',
    tagline: 'A skyline photographer documents impossible lights.',
    rating: '7.7',
    runtime: '1h 38m',
    genre: 'Adventure · Drama',
    posterUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
    providers: ['Disney+'],
    buzz: 68
  },
  {
    id: 'w3',
    title: 'Studio X',
    tagline: 'A design team builds a city in an abandoned mall.',
    rating: '8.8',
    runtime: '2h 02m',
    genre: 'Drama · Sci-Fi',
    posterUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=600&q=80',
    providers: ['Max'],
    buzz: 88
  }
];

const WatchlistScreen = () => {
  const maxSlots = 10;
  const count = watchlistItems.length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <SectionHeader title="WATCHLIST" subtitle="Your saved lineup." />
      <View style={styles.countRow}>
        <Text style={styles.countLabel}>Free plan</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{count}/{maxSlots}</Text>
        </View>
      </View>

      {count === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          message="Save titles to keep track of what to watch next."
        />
      ) : (
        watchlistItems.map((item) => <PosterCard key={item.id} {...item} size="small" />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0c0d12'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  countLabel: {
    color: '#9ea4b5',
    fontSize: 13,
    fontWeight: '600'
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1a1c24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  countText: {
    color: '#f5f5f5',
    fontSize: 12,
    fontWeight: '700'
  }
});

export default WatchlistScreen;
