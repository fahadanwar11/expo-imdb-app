/**
 * Wishlist — persisted to AsyncStorage so it survives restarts with no backend
 * (§5). Keyed by title id; stores the full `Title` so the wishlist screen can
 * render cards offline without re-fetching.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { Title } from '@/types';

export type WishItem = Title & { addedAt: number };

type WishlistState = {
  items: Record<number, WishItem>;
  /** Add if absent, remove if present. Returns true when now saved. */
  toggle: (title: Title) => boolean;
  add: (title: Title) => void;
  /** Re-insert a previously-removed item keeping its original addedAt (undo). */
  restore: (item: WishItem) => void;
  remove: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (title) => {
        const exists = !!get().items[title.id];
        if (exists) {
          get().remove(title.id);
          return false;
        }
        get().add(title);
        return true;
      },
      add: (title) =>
        set((s) =>
          s.items[title.id]
            ? s
            : { items: { ...s.items, [title.id]: { ...title, addedAt: Date.now() } } },
        ),
      restore: (item) =>
        set((s) => (s.items[item.id] ? s : { items: { ...s.items, [item.id]: item } })),
      remove: (id) =>
        set((s) => {
          if (!s.items[id]) return s;
          const next = { ...s.items };
          delete next[id];
          return { items: next };
        }),
      has: (id) => !!get().items[id],
      clear: () => set({ items: {} }),
    }),
    {
      name: 'marquee-wishlist',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Reactive membership check for a single title (subscribes to that id only). */
export const useIsWished = (id: number) => useWishlist((s) => !!s.items[id]);

/** All saved items as an array (shallow-compared to avoid render loops). */
export const useWishlistItems = () =>
  useWishlist(useShallow((s) => Object.values(s.items)));

export const useWishlistCount = () => useWishlist((s) => Object.keys(s.items).length);
