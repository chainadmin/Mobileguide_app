import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { usePlatformFilters, STREAMING_PLATFORMS } from '../context/PlatformFiltersContext';

const PlatformFiltersScreen = () => {
  const { selectedPlatforms, togglePlatform, isEnabled, setEnabled } = usePlatformFilters();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Streaming Services</Text>
        <Text style={styles.subtitle}>
          Select the platforms you subscribe to. When enabled, trending content will be filtered to show what's available on your services.
        </Text>
      </View>

      <View style={styles.toggleCard}>
        <View style={styles.toggleContent}>
          <Text style={styles.toggleLabel}>Enable Platform Filters</Text>
          <Text style={styles.toggleDescription}>
            Only show content on your selected services
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={setEnabled}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.textPrimary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AVAILABLE SERVICES</Text>
        <View style={styles.platformsGrid}>
          {STREAMING_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformCard,
                  isSelected && styles.platformCardSelected
                ]}
                onPress={() => togglePlatform(platform.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.platformLogo}>{platform.logo}</Text>
                <Text style={[
                  styles.platformName,
                  isSelected && styles.platformNameSelected
                ]}>
                  {platform.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedPlatforms.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            You've selected {selectedPlatforms.length} service{selectedPlatforms.length !== 1 ? 's' : ''}. 
            {isEnabled 
              ? ' Tonight picks and regional trending will show content on these platforms.'
              : ' Toggle the filter above to activate filtering.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  header: {
    marginBottom: spacing.xl
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border
  },
  toggleContent: {
    flex: 1,
    marginRight: spacing.md
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2
  },
  toggleDescription: {
    fontSize: 13,
    color: colors.textSecondary
  },
  section: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.md
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  platformCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative'
  },
  platformCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10'
  },
  platformLogo: {
    fontSize: 32,
    marginBottom: spacing.sm
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center'
  },
  platformNameSelected: {
    color: colors.textPrimary
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700'
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm
  },
  infoIcon: {
    fontSize: 16
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  }
});

export default PlatformFiltersScreen;
