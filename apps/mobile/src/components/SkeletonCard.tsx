import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

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
    backgroundColor: '#14151c',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  cardLarge: {
    marginBottom: 20
  },
  cardSmall: {
    marginBottom: 16
  },
  poster: {
    borderRadius: 18,
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
  content: {
    flex: 1,
    marginLeft: 16
  },
  genreLine: {
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#20222c'
  },
  titleLine: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#20222c',
    marginTop: 8
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
    borderRadius: 6,
    backgroundColor: '#20222c',
    marginTop: 10
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8
  },
  metaChip: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#20222c'
  },
  buzzBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#20222c',
    marginTop: 16
  }
});

export default SkeletonCard;
