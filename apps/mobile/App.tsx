import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './src/theme';
import { RegionProvider, useRegion } from './src/context/RegionContext';
import { WatchlistProvider } from './src/context/WatchlistContext';
import { EntitlementsProvider } from './src/context/EntitlementsContext';
import { PlatformFiltersProvider } from './src/context/PlatformFiltersContext';
import { AlertsProvider } from './src/context/AlertsContext';

import PaywallScreen from './src/screens/PaywallScreen';
import PlatformFiltersScreen from './src/screens/PlatformFiltersScreen';
import PodcastsScreen from './src/screens/PodcastsScreen';
import PodcastShowDetailScreen from './src/screens/PodcastShowDetailScreen';
import PodcastEpisodeDetailScreen from './src/screens/PodcastEpisodeDetailScreen';
import RegionSelectScreen from './src/screens/RegionSelectScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';
import TitleDetailScreen from './src/screens/TitleDetailScreen';
import TrendingScreen from './src/screens/TrendingScreen';
import UpcomingScreen from './src/screens/UpcomingScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';

const PODCAST_REGIONS = ['US', 'GB', 'CA'];

export type RootStackParamList = {
  Splash: undefined;
  RegionSelect: undefined;
  Tabs: undefined;
  TitleDetail: { mediaType: 'movie' | 'tv'; tmdbId: number };
  PodcastShowDetail: { showId: number };
  PodcastEpisodeDetail: { episodeId: number };
  Paywall: undefined;
  Settings: undefined;
  PlatformFilters: undefined;
};

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.tabBarBorder,
    primary: colors.accent
  }
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const Tabs = () => {
  const { region } = useRegion();
  const showPodcasts = region && PODCAST_REGIONS.includes(region.code);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 8,
          height: 60
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5
        }
      }}
    >
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Upcoming" component={UpcomingScreen} />
      {showPodcasts && <Tab.Screen name="Podcasts" component={PodcastsScreen} />}
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  return (
    <RegionProvider>
      <PlatformFiltersProvider>
        <AlertsProvider>
          <WatchlistProvider>
            <NavigationContainer theme={darkTheme}>
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background }
              }}
            >
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RegionSelect"
                component={RegionSelectScreen}
                options={{ title: 'Select Region' }}
              />
              <Stack.Screen
                name="Tabs"
                component={Tabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="TitleDetail"
                component={TitleDetailScreen}
                options={{ title: 'Details' }}
              />
              <Stack.Screen
                name="Paywall"
                component={PaywallScreen}
                options={{ title: 'Go Pro', presentation: 'modal' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
              <Stack.Screen
                name="PlatformFilters"
                component={PlatformFiltersScreen}
                options={{ title: 'Platform Filters' }}
              />
              <Stack.Screen
                name="PodcastShowDetail"
                component={PodcastShowDetailScreen}
                options={{ title: 'Podcast' }}
              />
              <Stack.Screen
                name="PodcastEpisodeDetail"
                component={PodcastEpisodeDetailScreen}
                options={{ title: 'Episode' }}
              />
            </Stack.Navigator>
            </NavigationContainer>
          </WatchlistProvider>
        </AlertsProvider>
      </PlatformFiltersProvider>
    </RegionProvider>
  );
};

const App = () => {
  return (
    <EntitlementsProvider>
      <AppContent />
    </EntitlementsProvider>
  );
};

export default App;
