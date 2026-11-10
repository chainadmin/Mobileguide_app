import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from './src/theme';
import { RegionProvider } from './src/context/RegionContext';
import { WatchlistProvider } from './src/context/WatchlistContext';
import { EntitlementsProvider } from './src/context/EntitlementsContext';
import { PlatformFiltersProvider } from './src/context/PlatformFiltersContext';
import { AlertsProvider } from './src/context/AlertsContext';
import AdBanner from './src/components/AdBanner';
import ErrorBoundary from './src/components/ErrorBoundary';

import PaywallScreenRaw from './src/screens/PaywallScreen';
import PlatformFiltersScreenRaw from './src/screens/PlatformFiltersScreen';
import PodcastsScreenRaw from './src/screens/PodcastsScreen';
import PodcastShowDetailScreenRaw from './src/screens/PodcastShowDetailScreen';
import PodcastEpisodeDetailScreenRaw from './src/screens/PodcastEpisodeDetailScreen';
import RegionSelectScreenRaw from './src/screens/RegionSelectScreen';
import SearchScreenRaw from './src/screens/SearchScreen';
import SettingsScreenRaw from './src/screens/SettingsScreen';
import SplashScreenRaw from './src/screens/SplashScreen';
import TitleDetailScreenRaw from './src/screens/TitleDetailScreen';
import TrendingScreenRaw from './src/screens/TrendingScreen';
import UpcomingScreenRaw from './src/screens/UpcomingScreen';
import WatchlistScreenRaw from './src/screens/WatchlistScreen';

// Each screen gets its own error boundary, so a render error in one screen
// shows a "try again" message there (with the header's back button still
// working) instead of crashing the app.
function withErrorBoundary<P extends object>(Screen: ComponentType<P>) {
  const Wrapped = (props: P) => (
    <ErrorBoundary>
      <Screen {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `withErrorBoundary(${Screen.displayName || Screen.name || 'Screen'})`;
  return Wrapped;
}

const PaywallScreen = withErrorBoundary(PaywallScreenRaw);
const PlatformFiltersScreen = withErrorBoundary(PlatformFiltersScreenRaw);
const PodcastsScreen = withErrorBoundary(PodcastsScreenRaw);
const PodcastShowDetailScreen = withErrorBoundary(PodcastShowDetailScreenRaw);
const PodcastEpisodeDetailScreen = withErrorBoundary(PodcastEpisodeDetailScreenRaw);
const RegionSelectScreen = withErrorBoundary(RegionSelectScreenRaw);
const SearchScreen = withErrorBoundary(SearchScreenRaw);
const SettingsScreen = withErrorBoundary(SettingsScreenRaw);
const SplashScreen = withErrorBoundary(SplashScreenRaw);
const TitleDetailScreen = withErrorBoundary(TitleDetailScreenRaw);
const TrendingScreen = withErrorBoundary(TrendingScreenRaw);
const UpcomingScreen = withErrorBoundary(UpcomingScreenRaw);
const WatchlistScreen = withErrorBoundary(WatchlistScreenRaw);

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
  Search: undefined;
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

const smoothStackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
  animationDuration: 280,
  animationTypeForReplace: 'push',
  gestureEnabled: true,
  fullScreenGestureEnabled: true
};

// The one ad banner for all tabs sits between the tab screens and the tab
// bar. Never render AdBanner inside a screen: visited tabs stay mounted, so
// that would create one ad view per tab.
const TabBarWithAd = (props: BottomTabBarProps) => (
  <View>
    <AdBanner />
    <BottomTabBar {...props} />
  </View>
);

const Tabs = () => {
  return (
    <Tab.Navigator
      tabBar={TabBarWithAd}
      screenOptions={{
        headerShown: false,
        lazy: true,
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
      <Tab.Screen name="Podcasts" component={PodcastsScreen} />
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
            <Stack.Navigator screenOptions={smoothStackScreenOptions}>
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{ headerShown: false, animation: 'fade', animationDuration: 350 }}
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
                options={{ title: 'Go Pro', presentation: 'modal', animation: 'slide_from_bottom' }}
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
                name="Search"
                component={SearchScreen}
                options={{ title: 'Search' }}
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
    <ErrorBoundary>
      <EntitlementsProvider>
        <AppContent />
      </EntitlementsProvider>
    </ErrorBoundary>
  );
};

export default App;
