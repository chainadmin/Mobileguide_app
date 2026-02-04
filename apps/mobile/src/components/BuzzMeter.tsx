import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../theme';

type BuzzMeterProps = {
  value: number;
  onPress?: () => void;
  showVoteHint?: boolean;
};

const BuzzMeter = ({ value, onPress, showVoteHint = false }: BuzzMeterProps) => {
  const displayValue = Math.min(100, Math.max(0, value));

  const content = (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>BUZZ METER</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(displayValue, 100)}%` }]} />
      </View>
      {showVoteHint && (
        <Text style={styles.hint}>Tap to buzz!</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
    color: colors.accent,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center'
  }
});

export default BuzzMeter;
