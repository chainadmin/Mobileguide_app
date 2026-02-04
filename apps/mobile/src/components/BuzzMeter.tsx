import { StyleSheet, Text, View } from 'react-native';

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
    marginTop: 12
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    color: '#a7b0c2',
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700'
  },
  value: {
    color: '#f5f5f5',
    fontSize: 12,
    fontWeight: '700'
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ff7a51'
  }
});

export default BuzzMeter;
