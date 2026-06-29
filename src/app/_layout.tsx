import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/queryClient';
import { useFilters } from '@/store/filters';
import { useThemeMode } from '@/store/theme';
import { useWishlist } from '@/store/wishlist';
import { AppThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { fontMap } from '@/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => {});

type Hydratable = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
};

const PERSISTED_STORES: Hydratable[] = [useThemeMode, useWishlist, useFilters];

/** True once every persisted store has rehydrated from AsyncStorage. */
function usePersistHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    PERSISTED_STORES.every((s) => s.persist.hasHydrated()),
  );
  useEffect(() => {
    if (hydrated) return;
    const check = () => setHydrated(PERSISTED_STORES.every((s) => s.persist.hasHydrated()));
    const unsubs = PERSISTED_STORES.map((s) => s.persist.onFinishHydration(check));
    check(); // cover the race where hydration finished before we subscribed
    return () => unsubs.forEach((u) => u());
  }, [hydrated]);
  return hydrated;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const storesHydrated = usePersistHydrated();

  // Render once fonts have settled (loaded OR failed) and stores have hydrated,
  // so the first frame already reflects the saved theme/wishlist/filters.
  const ready = (fontsLoaded || !!fontError) && storesHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <ReducedMotionConfig mode={ReduceMotion.System} />
            <RootNavigator />
          </AppThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { colors, scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="title/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="filters" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
