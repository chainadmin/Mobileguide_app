import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

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
    gap: spacing.sm
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border
  },
  text: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4
  }
});

export default ProviderChips;
