import { Image, StyleSheet, Text, View } from 'react-native';
import BuzzMeter from './BuzzMeter';
import ProviderChips from './ProviderChips';
import { colors, borderRadius, spacing } from '../theme';

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
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  cardLarge: {
    marginBottom: spacing.lg
  },
  cardSmall: {
    marginBottom: spacing.md
  },
  posterWrap: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.skeleton
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,10,20,0.25)'
  },
  posterBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent + 'E6'
  },
  posterBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '800'
  },
  content: {
    flex: 1,
    marginLeft: spacing.md
  },
  genre: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs
  },
  titleLarge: {
    fontSize: 20
  },
  titleSmall: {
    fontSize: 17
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    lineHeight: 18
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing.sm
  }
});

export default PosterCard;
