import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type BuzzMeterProps = {
  value: number;
};

const BuzzMeter = ({ value }: BuzzMeterProps) => {
  const fillWidth = Math.min(100, value);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>REGIONAL BUZZ</Text>
        <Text style={styles.value}>{value} views</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillWidth}%` }]} />
      </View>
      <Text style={styles.hint}>Views in your region</Text>
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
  },
  hint: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4
  }
});

export default BuzzMeter;
