/**
 * Resolves the active theme (mode store + system scheme) into a `Theme` object
 * and exposes it via `useTheme()`. Also wires the navigation theme so router
 * chrome (headers, backgrounds) matches our palette.
 */
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeMode } from '@/store/theme';
import { blur, palettes, radius, spacing, type ColorScheme, type Theme } from '@/theme/tokens';

const ThemeContext = createContext<Theme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = useThemeMode((s) => s.mode);

  const scheme: ColorScheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const theme = useMemo<Theme>(
    () => ({ scheme, colors: palettes[scheme], radius, blur, spacing }),
    [scheme],
  );

  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? NavDarkTheme : NavLightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.bg,
        card: theme.colors.bg,
        text: theme.colors.text,
        primary: theme.colors.accent,
        border: theme.colors.border,
      },
    };
  }, [scheme, theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationThemeProvider value={navTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <AppThemeProvider>');
  return ctx;
}
