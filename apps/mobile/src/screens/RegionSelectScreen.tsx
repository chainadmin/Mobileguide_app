import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, spacing, borderRadius } from '../theme';
import { REGIONS, useRegion } from '../context/RegionContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegionSelectScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { region: currentRegion, setRegion } = useRegion();

  const handleSelect = async (regionCode: string) => {
    const selected = REGIONS.find(r => r.code === regionCode);
    if (selected) {
      await setRegion(selected);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Region</Text>
      <Text style={styles.subtitle}>
        Content and buzz popularity will be based on your selected area
      </Text>
      
      <FlatList
        data={REGIONS}
        keyExtractor={(item) => item.code}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.regionItem,
              currentRegion?.code === item.code && styles.regionItemSelected
            ]}
            onPress={() => handleSelect(item.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.regionName}>{item.name}</Text>
            <Text style={styles.regionCode}>{item.code}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg
  },
  list: {
    paddingBottom: spacing.xl
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  regionItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15'
  },
  regionName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500'
  },
  regionCode: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600'
  }
});

export default RegionSelectScreen;
