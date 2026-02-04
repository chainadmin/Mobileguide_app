import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors } from '../theme';

type SplashNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Tabs');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>STREAMGUIDE</Text>
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
