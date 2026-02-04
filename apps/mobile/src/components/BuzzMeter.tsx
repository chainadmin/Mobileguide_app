import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type BuzzMeterProps = {
  value: number;
};

const BuzzMeter = ({ value }: BuzzMeterProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>BUZZ METER</Text>
        <Text style={styles.value}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700'
  },
  value: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent
  }
});

export default BuzzMeter;
