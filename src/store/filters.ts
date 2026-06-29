/**
 * Search / Discover filter state, persisted so a user's last filters stick.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Filters, SortKey, TypeFilter } from '@/types';

export const DEFAULT_FILTERS: Filters = {
  genreIds: [],
  minRating: 0,
  year: undefined,
  type: 'all',
  sort: 'popularity',
};

/** Number of active (non-default) filter dimensions — for the badge + gating. */
export function countActiveFilters(f: Filters): number {
  return (
    f.genreIds.length +
    (f.minRating > 0 ? 1 : 0) +
    (f.year ? 1 : 0) +
    (f.type !== 'all' ? 1 : 0) +
    (f.sort !== 'popularity' ? 1 : 0)
  );
}

type FiltersState = {
  filters: Filters;
  toggleGenre: (id: number) => void;
  setMinRating: (rating: number) => void;
  setYear: (year?: number) => void;
  setType: (type: TypeFilter) => void;
  setSort: (sort: SortKey) => void;
  clear: () => void;
};

export const useFilters = create<FiltersState>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      toggleGenre: (id) =>
        set((s) => {
          const has = s.filters.genreIds.includes(id);
          return {
            filters: {
              ...s.filters,
              genreIds: has
                ? s.filters.genreIds.filter((g) => g !== id)
                : [...s.filters.genreIds, id],
            },
          };
        }),
      setMinRating: (minRating) => set((s) => ({ filters: { ...s.filters, minRating } })),
      setYear: (year) => set((s) => ({ filters: { ...s.filters, year } })),
      setType: (type) => set((s) => ({ filters: { ...s.filters, type } })),
      setSort: (sort) => set((s) => ({ filters: { ...s.filters, sort } })),
      clear: () => set({ filters: DEFAULT_FILTERS }),
    }),
    {
      name: 'marquee-filters',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
