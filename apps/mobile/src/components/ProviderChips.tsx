import { StyleSheet, Text, View } from 'react-native';

type ProviderChipsProps = {
  providers: string[];
};

const ProviderChips = ({ providers }: ProviderChipsProps) => {
  return (
    <View style={styles.container}>
      {providers.map((provider) => (
        <View key={provider} style={styles.chip}>
          <Text style={styles.text}>{provider}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  text: {
    color: '#f2f2f2',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4
  }
});

export default ProviderChips;
