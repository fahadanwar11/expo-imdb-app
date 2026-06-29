import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroCarousel } from '@/components/HeroCarousel';
import { Rail } from '@/components/Rail';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState, errorMessage } from '@/components/StateViews';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGenres } from '@/hooks/useGenres';
import {
  useAiringToday,
  useNowPlaying,
  usePopularMovies,
  useTopRatedMovies,
  useTrendingAll,
  useTrendingTv,
} from '@/hooks/useTitles';
import { MISSING_KEY_MESSAGE } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const trending = useTrendingAll();
  const popular = usePopularMovies();
  const topRated = useTopRatedMovies();
  const trendingTv = useTrendingTv();
  const nowPlaying = useNowPlaying();
  const airing = useAiringToday();
  const genres = useGenres();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      trending.refetch(),
      popular.refetch(),
      topRated.refetch(),
      trendingTv.refetch(),
      nowPlaying.refetch(),
      airing.refetch(),
      genres.refetch(),
    ]);
    setRefreshing(false);
  };

  // If the API key is missing/invalid, every query fails the same way — show one clear screen.
  const keyError = trending.isError && errorMessage(trending.error) === MISSING_KEY_MESSAGE;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
      }>
      <ScreenHeader title="Marquee" subtitle="Discover movies & series" right={<ThemeToggle />} />

      {keyError ? (
        <View style={styles.keyError}>
          <ErrorState error={trending.error} onRetry={trending.refetch} />
        </View>
      ) : (
        <>
          {trending.isPending ? (
            <HeroSkeleton />
          ) : trending.isError ? (
            <View style={styles.heroError}>
              <ErrorState error={trending.error} onRetry={trending.refetch} compact />
            </View>
          ) : (
            <HeroCarousel titles={trending.data ?? []} genreById={genres.data?.byId} />
          )}

          <View style={styles.rails}>
            <Rail title="Popular Movies" query={popular} />
            <Rail title="Top Rated" query={topRated} />
            <Rail title="Trending TV" query={trendingTv} />
            <Rail title="Now Playing" query={nowPlaying} />
            <Rail title="Airing Today" query={airing} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function HeroSkeleton() {
  return (
    <View style={styles.heroSkeleton}>
      <Skeleton height={300} radius={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  rails: { marginTop: 28 },
  heroSkeleton: { paddingHorizontal: 16 },
  heroError: { paddingHorizontal: 16, height: 220, justifyContent: 'center' },
  keyError: { flex: 1, minHeight: 420 },
});
