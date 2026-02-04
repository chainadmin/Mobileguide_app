import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors } from '../theme';
import { useRegion } from '../context/RegionContext';

type SplashNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNavigationProp>();
  const { region, isLoading } = useRegion();

  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      if (region) {
        navigation.replace('Tabs');
      } else {
        navigation.replace('RegionSelect');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, region, isLoading]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BUZZREEL</Text>
      <Text style={styles.tagline}>What's blowing up tonight</Text>
      <View style={styles.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 4
  },
  tagline: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 1
  },
  accent: {
    marginTop: 24,
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent
  }
});

export default SplashScreen;
