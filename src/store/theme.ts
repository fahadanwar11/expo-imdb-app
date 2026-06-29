/**
 * Theme mode store (System / Light / Dark), persisted so the choice survives
 * restarts. The resolved color scheme is computed in `theme/ThemeProvider`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

type ThemeModeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Cycle System → Light → Dark → System (for a single toggle button). */
  cycle: () => void;
};

export const useThemeMode = create<ThemeModeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      cycle: () => {
        const i = ORDER.indexOf(get().mode);
        set({ mode: ORDER[(i + 1) % ORDER.length] });
      },
    }),
    {
      name: 'marquee-theme',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
