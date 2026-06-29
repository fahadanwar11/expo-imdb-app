/**
 * Typography — Sora for display/headings/numerals, Inter for body/UI (§7).
 * Font family strings are the keys we register with `useFonts` in the root layout.
 */
import type { TextStyle } from 'react-native';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';

/** The map passed to `useFonts`. Keys become the usable `fontFamily` values. */
export const fontMap = {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} as const;

export const fonts = {
  display: 'Sora_800ExtraBold',
  heading: 'Sora_700Bold',
  headingSemi: 'Sora_600SemiBold',
  /** Sora has excellent numerals — used for ratings. */
  numerals: 'Sora_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Text scale presets (§7). */
export const textVariants = {
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  h1: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  h2: { fontFamily: fonts.headingSemi, fontSize: 18, lineHeight: 24 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
