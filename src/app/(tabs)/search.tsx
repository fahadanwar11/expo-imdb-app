import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { GlassSurface } from '@/components/GlassSurface';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState, ErrorState } from '@/components/StateViews';
import { TitleGrid } from '@/components/TitleGrid';
import { useDebounce } from '@/hooks/useDebounce';
import { useGenres } from '@/hooks/useGenres';
import { useDiscover, useSearch } from '@/hooks/useTitles';
import { POSTER_ASPECT } from '@/lib/constants';
import { countActiveFilters, useFilters } from '@/store/filters';
import { useTheme } from '@/theme/ThemeProvider';
import type { Filters, SortKey, TypeFilter } from '@/types';

const SORT_LABEL: Record<SortKey, string> = {
  popularity: 'Popular',
  rating: 'Top rated',
  release: 'Newest',
};
const TYPE_LABEL: Record<TypeFilter, string> = { all: 'All', movie: 'Movies', tv: 'TV' };

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const trimmed = debounced.trim();
  const searching = trimmed.length > 0;

  const { filters } = useFilters();
  const activeCount = countActiveFilters(filters);
  const filtering = !searching && activeCount > 0;

  const search = useSearch(debounced);
  const discover = useDiscover(filters, filtering);

  const active = searching ? search : discover;
  const showPrompt = !searching && !filtering;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + 8 }]}>
      <ScreenHeader title="Search" />

      <View style={styles.controls}>
        <GlassSurface strong radius={16} style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textDim} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Movies, shows, people…"
            placeholderTextColor={colors.textDim}
            style={[styles.input, { color: colors.text }]}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={13} accessibilityRole="button" accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textDim} />
            </Pressable>
          )}
        </GlassSurface>

        <FilterRow filters={filters} activeCount={activeCount} disabled={searching} />
      </View>

      {showPrompt ? (
        <EmptyState
          icon="search-outline"
          title="Find your next watch"
          subtitle="Search across movies, TV and people — or tap Filters to browse by genre, rating and year."
          actionLabel="Open filters"
          onAction={() => router.push('/filters')}
        />
      ) : active.isError ? (
        <ErrorState error={active.error} onRetry={active.refetch} />
      ) : active.isPending ? (
        <SearchGridSkeleton />
      ) : (
        <TitleGrid
          titles={active.data ?? []}
          contentContainerStyle={{ paddingBottom: 110 }}
          onEndReached={() => {
            if (active.hasNextPage && !active.isFetchingNextPage) active.fetchNextPage();
          }}
          isFetchingNextPage={active.isFetchingNextPage}
          ListEmptyComponent={
            <EmptyState
              icon="sad-outline"
              title="No results"
              subtitle={searching ? `Nothing matches “${trimmed}”.` : 'No titles match these filters. Try widening them.'}
            />
          }
        />
      )}
    </View>
  );
}

function FilterRow({
  filters,
  activeCount,
  disabled,
}: {
  filters: Filters;
  activeCount: number;
  disabled: boolean;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const { toggleGenre, setMinRating, setYear, setType, setSort } = useFilters();
  const genres = useGenres();

  return (
    <View style={styles.filterRow}>
      <Chip
        label={activeCount > 0 ? `Filters · ${activeCount}` : 'Filters'}
        icon="options-outline"
        selected={activeCount > 0}
        onPress={() => router.push('/filters')}
      />
      {disabled ? (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textDim} />
        </View>
      ) : (
        <>
          {filters.type !== 'all' && (
            <Chip label={TYPE_LABEL[filters.type]} selected onRemove={() => setType('all')} />
          )}
          {filters.sort !== 'popularity' && (
            <Chip label={SORT_LABEL[filters.sort]} selected onRemove={() => setSort('popularity')} />
          )}
          {filters.minRating > 0 && (
            <Chip label={`${filters.minRating.toFixed(1)}+`} selected onRemove={() => setMinRating(0)} />
          )}
          {filters.year && (
            <Chip label={String(filters.year)} selected onRemove={() => setYear(undefined)} />
          )}
          {filters.genreIds.map((id) => (
            <Chip
              key={id}
              label={genres.data?.byId[id] ?? '…'}
              selected
              onRemove={() => toggleGenre(id)}
            />
          ))}
        </>
      )}
    </View>
  );
}

function SearchGridSkeleton() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 16 * 2 - 14) / 2;
  const cardHeight = cardWidth / POSTER_ASPECT;
  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} width={cardWidth} height={cardHeight} radius={20} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  controls: { paddingHorizontal: 16, gap: 12, marginBottom: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 48 },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, height: '100%' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  hint: { justifyContent: 'center' },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 16,
  },
});
