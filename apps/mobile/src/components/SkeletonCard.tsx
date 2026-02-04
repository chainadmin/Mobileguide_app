import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

type SkeletonCardProps = {
  size?: 'large' | 'small';
};

const SkeletonCard = ({ size = 'large' }: SkeletonCardProps) => {
  const isLarge = size === 'large';
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={[styles.card, isLarge ? styles.cardLarge : styles.cardSmall]}>
      <Animated.View
        style={[
          styles.poster,
          isLarge ? styles.posterLarge : styles.posterSmall,
          { opacity }
        ]}
      />
      <View style={styles.content}>
        <Animated.View style={[styles.genreLine, { opacity }]} />
        <Animated.View style={[styles.titleLine, isLarge ? styles.titleLarge : styles.titleSmall, { opacity }]} />
        <Animated.View style={[styles.taglineLine, { opacity }]} />
        <View style={styles.metaRow}>
          <Animated.View style={[styles.metaChip, { opacity }]} />
          <Animated.View style={[styles.metaChip, { opacity }]} />
        </View>
        <Animated.View style={[styles.buzzBar, { opacity }]} />
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
    borderColor: colors.border
  },
  cardLarge: {
    marginBottom: spacing.lg
  },
  cardSmall: {
    marginBottom: spacing.md
  },
  poster: {
    borderRadius: borderRadius.lg,
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
  content: {
    flex: 1,
    marginLeft: spacing.md
  },
  genreLine: {
    width: 80,
    height: 12,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeleton
  },
  titleLine: {
    height: 20,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton,
    marginTop: spacing.sm
  },
  titleLarge: {
    width: '90%'
  },
  titleSmall: {
    width: '80%'
  },
  taglineLine: {
    width: '70%',
    height: 12,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeleton,
    marginTop: spacing.sm
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm
  },
  metaChip: {
    width: 60,
    height: 24,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton
  },
  buzzBar: {
    width: '100%',
    height: 8,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeleton,
    marginTop: spacing.md
  }
});

export default SkeletonCard;
