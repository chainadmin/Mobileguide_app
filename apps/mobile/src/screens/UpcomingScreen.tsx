import { SectionList, StyleSheet, Text, View } from 'react-native';
import PosterCard from '../components/PosterCard';
import SectionHeader from '../components/SectionHeader';

const upcomingItems = [
  {
    id: 'u1',
    title: 'Neon Harbor',
    tagline: 'A port city holds a secret under every docklight.',
    rating: '8.0',
    runtime: '1h 57m',
    genre: 'Drama · Mystery',
    posterUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    providers: ['Netflix'],
    buzz: 72,
    releaseDate: 'May 19'
  },
  {
    id: 'u2',
    title: 'Signal Noire',
    tagline: 'Radio hosts unravel a hidden cult on air.',
    rating: '7.8',
    runtime: '1h 41m',
    genre: 'Horror · Thriller',
    posterUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    providers: ['Shudder', 'Prime Video'],
    buzz: 65,
    releaseDate: 'May 19'
  },
  {
    id: 'u3',
    title: 'Golden Hour Diaries',
    tagline: 'A chef team tours the world at sunset.',
    rating: '8.4',
    runtime: '52m',
    genre: 'Travel · Food',
    posterUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    providers: ['HBO Max'],
    buzz: 78,
    releaseDate: 'May 23'
  },
  {
    id: 'u4',
    title: 'Afterglow Street',
    tagline: 'Skaters chase the last light of summer.',
    rating: '7.6',
    runtime: '1h 35m',
    genre: 'Coming-of-age',
    posterUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    providers: ['Disney+'],
    buzz: 70,
    releaseDate: 'May 23'
  },
  {
    id: 'u5',
    title: 'Static Bloom',
    tagline: 'A hacker collective rewrites a fashion empire.',
    rating: '8.2',
    runtime: '2h 09m',
    genre: 'Drama · Tech',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    providers: ['Apple TV+'],
    buzz: 83,
    releaseDate: 'May 28'
  }
];

const groupedItems = upcomingItems.reduce<Record<string, typeof upcomingItems>>((acc, item) => {
  if (!acc[item.releaseDate]) {
    acc[item.releaseDate] = [];
  }
  acc[item.releaseDate].push(item);
  return acc;
}, {});

const sections = Object.entries(groupedItems).map(([title, data]) => ({ title, data }));

const UpcomingScreen = () => {
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
    backgroundColor: '#0c0d12'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 12
  },
  dateHeader: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 12
  }
});

export default UpcomingScreen;
