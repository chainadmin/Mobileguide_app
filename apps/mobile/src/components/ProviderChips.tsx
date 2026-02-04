import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { usePlatformFilters, STREAMING_PLATFORMS } from '../context/PlatformFiltersContext';
import { useEntitlements } from '../context/EntitlementsContext';

type ProviderChipsProps = {
  providers: string[];
};

const ProviderChips = ({ providers }: ProviderChipsProps) => {
  const { isPro } = useEntitlements();
  const { selectedPlatforms, isEnabled } = usePlatformFilters();
  
  const isHighlighted = (providerName: string): boolean => {
    if (!isPro || !isEnabled || selectedPlatforms.length === 0) return false;
    
    const platform = STREAMING_PLATFORMS.find(p => 
      providerName.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(providerName.toLowerCase())
    );
    
    return platform ? selectedPlatforms.includes(platform.id) : false;
  };

  return (
    <View style={styles.container}>
      {providers.map((provider) => {
        const highlighted = isHighlighted(provider);
        return (
          <View 
            key={provider} 
            style={[styles.chip, highlighted && styles.chipHighlighted]}
          >
            <Text style={[styles.text, highlighted && styles.textHighlighted]}>
              {provider}
            </Text>
          </View>
        );
      })}
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
  chipHighlighted: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent + '40'
  },
  text: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4
  },
  textHighlighted: {
    color: colors.accent
  }
});

export default ProviderChips;
