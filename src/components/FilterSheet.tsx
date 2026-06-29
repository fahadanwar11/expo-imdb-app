/**
 * Filter controls (§3.2) — edits the persisted filters store live. Genre
 * (multi), min rating (slider), year, type, and sort. Rendered by the
 * `filters` modal route.
 */
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/StateViews';
import { useGenres } from '@/hooks/useGenres';
import { countActiveFilters, useFilters } from '@/store/filters';
import { useTheme } from '@/theme/ThemeProvider';
import type { SortKey, TypeFilter } from '@/types';

const TYPE_OPTIONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popularity', label: 'Popular' },
  { key: 'rating', label: 'Top rated' },
  { key: 'release', label: 'Newest' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="overline" dim>
        {label}
      </AppText>
      {children}
    </View>
  );
}

export function FilterSheet({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { filters, toggleGenre, setMinRating, setYear, setType, setSort, clear } = useFilters();
  const genresQuery = useGenres();
  const [ratingDraft, setRatingDraft] = useState(filters.minRating);
  const [syncedMin, setSyncedMin] = useState(filters.minRating);
  const activeCount = countActiveFilters(filters);

  // Resync the slider thumb/label when the store's minRating changes by another
  // path (e.g. "Clear all") — React's "adjust state during render" pattern.
  // During a drag only ratingDraft changes, so this is a no-op then.
  if (filters.minRating !== syncedMin) {
    setSyncedMin(filters.minRating);
    setRatingDraft(filters.minRating);
  }

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <AppText variant="h1">Filters</AppText>
        <View style={styles.headerRight}>
          {activeCount > 0 && (
            <Pressable onPress={clear} hitSlop={8} accessibilityRole="button">
              <AppText variant="captionMedium" color={colors.accentText}>
                Clear all
              </AppText>
            </Pressable>
          )}
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close filters">
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Field label="Type">
          <View style={styles.row}>
            {TYPE_OPTIONS.map((o) => (
              <Chip key={o.key} label={o.label} selected={filters.type === o.key} onPress={() => setType(o.key)} />
            ))}
          </View>
        </Field>

        <Field label="Sort by">
          <View style={styles.row}>
            {SORT_OPTIONS.map((o) => (
              <Chip key={o.key} label={o.label} selected={filters.sort === o.key} onPress={() => setSort(o.key)} />
            ))}
          </View>
        </Field>

        <Field label={ratingDraft > 0 ? `Minimum rating · ${ratingDraft.toFixed(1)}+` : 'Minimum rating · Any'}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={0.5}
            value={ratingDraft}
            onValueChange={setRatingDraft}
            onSlidingComplete={setMinRating}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
          />
        </Field>

        <Field label="Year">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            <Chip label="Any" selected={!filters.year} onPress={() => setYear(undefined)} />
            {YEARS.map((y) => (
              <Chip
                key={y}
                label={String(y)}
                selected={filters.year === y}
                onPress={() => setYear(filters.year === y ? undefined : y)}
              />
            ))}
          </ScrollView>
        </Field>

        <Field label="Genres">
          {genresQuery.isPending ? (
            <View style={styles.wrap}>
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} width={84} height={36} radius={999} />
              ))}
            </View>
          ) : genresQuery.isError ? (
            <ErrorState error={genresQuery.error} onRetry={genresQuery.refetch} compact />
          ) : (
            <View style={styles.wrap}>
              {genresQuery.data?.genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  selected={filters.genreIds.includes(g.id)}
                  onPress={() => toggleGenre(g.id)}
                />
              ))}
            </View>
          )}
        </Field>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: Math.max(16, insets.bottom + 8) }]}>
        <Button label="Show results" icon="options-outline" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(128,128,128,0.4)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24, gap: 22 },
  field: { gap: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slider: { width: '100%', height: 40 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
