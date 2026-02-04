import { ScrollView, StyleSheet, View } from 'react-native';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';

const tonightPicks = [
  {
    id: '1',
    title: 'Midnight Avenue',
    tagline: 'A noir mystery stitched with neon dreams.',
    rating: '8.6',
    runtime: '2h 04m',
    genre: 'Crime · Thriller',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    providers: ['Hulu', 'Prime Video'],
    buzz: 86
  },
  {
    id: '2',
    title: 'Velvet Sky',
    tagline: 'A fashion editor uncovers a cosmic conspiracy.',
    rating: '9.1',
    runtime: '1h 49m',
    genre: 'Sci-Fi · Drama',
    posterUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=600&q=80',
    providers: ['Netflix', 'Max'],
    buzz: 92
  }
];

const trendingNearYou = [
  {
    id: '3',
    title: 'Signal Sunset',
    tagline: 'Two rivals chase the same pirate broadcast.',
    rating: '7.9',
    runtime: '1h 33m',
    genre: 'Action · Indie',
    posterUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    providers: ['Apple TV+', 'Tubi'],
    buzz: 74
  },
  {
    id: '4',
    title: 'Echo District',
    tagline: 'A detective hunts a glitch in the city grid.',
    rating: '8.2',
    runtime: '2h 11m',
    genre: 'Mystery · Tech',
    posterUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
    providers: ['Prime Video', 'Peacock'],
    buzz: 81
  },
  {
    id: '5',
    title: 'Sunroom Sessions',
    tagline: 'A docu-series on artists who design with light.',
    rating: '7.4',
    runtime: '43m',
    genre: 'Documentary',
    posterUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    providers: ['Discovery+', 'Roku'],
    buzz: 67
  }
];

const TrendingScreen = () => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <SectionHeader title="TONIGHT 🔥" subtitle="Top picks curated for your evening." />
      <View style={styles.section}>
        {tonightPicks.map((item) => (
          <PosterCard key={item.id} {...item} size="large" />
        ))}
      </View>

      <SectionHeader title="TRENDING NEAR YOU" subtitle="Fresh buzz in your city right now." />
      <View style={styles.section}>
        {trendingNearYou.map((item) => (
          <PosterCard key={item.id} {...item} size="small" />
        ))}
      </View>
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
  section: {
    marginBottom: 28
  }
});

export default TrendingScreen;
