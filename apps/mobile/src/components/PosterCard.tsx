import { Image, StyleSheet, Text, View } from 'react-native';
import BuzzMeter from './BuzzMeter';
import ProviderChips from './ProviderChips';

type PosterCardProps = {
  title: string;
  tagline: string;
  rating: string;
  runtime: string;
  genre: string;
  posterUrl: string;
  providers: string[];
  buzz: number;
  size?: 'large' | 'small';
};

const PosterCard = ({
  title,
  tagline,
  rating,
  runtime,
  genre,
  posterUrl,
  providers,
  buzz,
  size = 'large'
}: PosterCardProps) => {
  const isLarge = size === 'large';

  return (
    <View style={[styles.card, isLarge ? styles.cardLarge : styles.cardSmall]}>
      <View style={[styles.posterWrap, isLarge ? styles.posterLarge : styles.posterSmall]}>
        <Image source={{ uri: posterUrl }} style={styles.poster} />
        <View style={styles.posterOverlay} />
        <View style={styles.posterBadge}>
          <Text style={styles.posterBadgeText}>{rating}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.genre}>{genre}</Text>
        <Text style={[styles.title, isLarge ? styles.titleLarge : styles.titleSmall]}>
          {title}
        </Text>
        <Text style={styles.tagline}>{tagline}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{runtime}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>Top Pick</Text>
        </View>
        <ProviderChips providers={providers} />
        <BuzzMeter value={buzz} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#14151c',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  cardLarge: {
    marginBottom: 20
  },
  cardSmall: {
    marginBottom: 16
  },
  posterWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#20222c'
  },
  posterLarge: {
    width: 120,
    height: 170
  },
  posterSmall: {
    width: 96,
    height: 136
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  posterOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(10,10,20,0.25)'
  },
  posterBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,122,81,0.9)'
  },
  posterBadgeText: {
    color: '#111',
    fontSize: 11,
    fontWeight: '800'
  },
  content: {
    flex: 1,
    marginLeft: 16
  },
  genre: {
    color: '#ff7a51',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1
  },
  title: {
    color: '#f5f5f5',
    fontWeight: '700',
    marginTop: 6
  },
  titleLarge: {
    fontSize: 20
  },
  titleSmall: {
    fontSize: 17
  },
  tagline: {
    color: '#9ea4b5',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12
  },
  metaText: {
    color: '#cbd0dd',
    fontSize: 11,
    fontWeight: '600'
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#62697a',
    marginHorizontal: 8
  }
});

export default PosterCard;
