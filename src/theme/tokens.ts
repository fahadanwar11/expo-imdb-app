/**
 * Design tokens — the single source of truth for the glass design system (§6).
 * Posters provide the color; chrome stays neutral and translucent.
 */

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  /** App background. */
  bg: string;
  /** Glass fill placed over a BlurView. */
  surface: string;
  /** A more opaque glass fill for surfaces that carry small text. */
  surfaceStrong: string;
  /** Hairline border on glass edges. */
  border: string;
  text: string;
  textDim: string;
  /** Warm "marquee" gold — used as a FILL (behind dark text) for ratings & CTAs. */
  accent: string;
  /** Accent used as TEXT/ICON color on glass — AA-contrast variant of `accent`. */
  accentText: string;
  /** Cool glow for interactive/pressed states. */
  accent2: string;
  /** Base color for gradient scrims placed behind text over images. */
  scrim: string;
  /** Shimmer/skeleton base. */
  skeleton: string;
  /** Top glass-edge highlight gradient [top, bottom]. */
  highlight: readonly [string, string];
  /** BlurView tint that matches this scheme. */
  blurTint: 'light' | 'dark';
};

export const radius = { sm: 12, card: 20, sheet: 28, chip: 999 } as const;

/** BlurView intensities per surface kind. */
export const blur = { card: 18, hero: 22, tabbar: 30, sheet: 40 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const dark: ThemeColors = {
  bg: '#070A12',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.12)',
  text: '#F5F7FA',
  textDim: 'rgba(245,247,250,0.6)',
  accent: '#FFC857',
  accentText: '#FFC857',
  accent2: '#5BC8FF',
  scrim: '#070A12',
  skeleton: 'rgba(255,255,255,0.08)',
  highlight: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)'],
  blurTint: 'dark',
};

export const light: ThemeColors = {
  bg: '#F4F6FB',
  surface: 'rgba(255,255,255,0.55)',
  surfaceStrong: 'rgba(255,255,255,0.78)',
  border: 'rgba(10,15,30,0.08)',
  text: '#0A0F1E',
  textDim: 'rgba(10,15,30,0.55)',
  accent: '#E0A100',
  // Darker gold for text/icons — ≈5:1 on the light glass surface (AA).
  accentText: '#8A6200',
  accent2: '#0A84FF',
  scrim: '#0A0F1E',
  skeleton: 'rgba(10,15,30,0.06)',
  highlight: ['rgba(255,255,255,0.55)', 'rgba(10,15,30,0.04)'],
  blurTint: 'light',
};

export const palettes: Record<ColorScheme, ThemeColors> = { light, dark };

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  radius: typeof radius;
  blur: typeof blur;
  spacing: typeof spacing;
};
