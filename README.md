# Marquee 🎬

A polished, glassmorphic movie & TV discovery app built with **Expo SDK 56 / React Native**. Browse trending titles, search across movies/TV/people, filter by genre · rating · year · type · sort, and keep a wishlist that survives restarts — all in a frosted-glass, light/dark design system.

> Uses [TMDB](https://www.themoviedb.org/) as the data source (IMDB has no free public API). Optional [OMDb](https://www.omdbapi.com/) enrichment adds the "IMDB feel" (IMDb / Rotten Tomatoes / Metascore) on the detail screen. Marquee is the product name — *not* affiliated with IMDB.

## Quick start

```bash
# 1. Install deps (already installed if you cloned this folder)
npm install

# 2. Add your API key(s)
cp .env.example .env
#   → set EXPO_PUBLIC_TMDB_KEY (free: https://www.themoviedb.org/settings/api)
#   → optionally set EXPO_PUBLIC_OMDB_KEY (free: https://www.omdbapi.com/apikey.aspx)

# 3. Run
npx expo start            # then press i / a, or scan the QR in Expo Go
```

If the key is missing or invalid, the app shows a clear, friendly error screen instead of crashing.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 54 (RN 0.81, React 19.1, New Arch, React Compiler) — runs in Expo Go |
| Language | TypeScript (strict) |
| Routing | expo-router (file-based, typed routes) |
| Data fetching | @tanstack/react-query v5 (infinite scroll, caching) |
| State | zustand v5 + `persist` (AsyncStorage) |
| Images | expo-image (blurhash placeholders, disk cache) |
| Glass / glow | expo-blur · expo-linear-gradient |
| Animation | react-native-reanimated v4 (press/scale, parallax, layout) |
| Rating ring | react-native-svg |
| Icons / fonts | @expo/vector-icons · Sora + Inter |

## Architecture

```
src/
  app/                       # expo-router routes
    _layout.tsx              # providers (QueryClient, theme, fonts, gesture root) + root Stack
    (tabs)/
      _layout.tsx            # custom frosted-glass tab bar
      index.tsx              # Discover (hero + rails)
      search.tsx             # Search + filter chips
      wishlist.tsx           # Wishlist (persisted, undo remove)
    title/[id].tsx           # Detail (modal, parallax backdrop)
    filters.tsx              # Filter sheet (modal)
  components/                # GlassCard, GlassSurface, RatingRing, HeroCarousel, TabBar, FilterSheet, …
  lib/        tmdb.ts  omdb.ts  imdbAdapter.ts  images.ts  queryClient.ts  constants.ts
  hooks/      useTitles.ts  useTitleDetail.ts  useGenres.ts  useDebounce.ts
  store/      wishlist.ts  filters.ts  theme.ts
  theme/      tokens.ts  ThemeProvider.tsx  typography.ts
  types/      index.ts
```

**Data flow.** UI speaks only the normalized `Title` / `TitleDetail` shapes. `lib/tmdb.ts` is a typed fetch wrapper returning raw TMDB JSON; `lib/imdbAdapter.ts` is the *single* mapping layer that normalizes TMDB (and optional OMDb) into those shapes. Swapping the data source later only touches the adapter.

**Theming.** All tokens live in `theme/tokens.ts` (single source of truth). `theme/ThemeProvider.tsx` resolves System/Light/Dark (persisted in `store/theme.ts`) into the active palette and also drives the navigation theme. Tap the toggle on Discover to cycle modes.

## Features

- **Discover** — swipeable trending hero + infinitely-paginated rails (Popular, Top Rated, Trending TV, Now Playing, Airing Today), pull-to-refresh, skeleton shimmer.
- **Search** — 300ms-debounced multi-search; with the query empty and filters active it switches to TMDB Discover. Active filters show as removable chips with "Clear all".
- **Filters** — genre (multi), min-rating slider (0–10), year, type (All/Movies/TV), sort (Popular/Top rated/Newest). Persisted.
- **Detail** — parallax backdrop, rating ring, optional IMDb/RT/Metascore badges, overview, cast, where-to-watch, trailer link, "More like this", and an animated wishlist toggle.
- **Wishlist** — persisted to AsyncStorage (no backend); filter by type, sort by recent/rating, long-press a card to remove with an undo toast.
- **Polish** — frosted floating tab bar, press-scale + colored glow on cards, blurhash placeholders, friendly error/empty states, haptics, and full **Reduce Motion** support.

## Notes & limitations

- **Shared-element transitions:** Reanimated 4 ships `sharedTransitionTag` behind a disabled feature flag (runtime no-op), so the card→detail transition uses a modal slide + staggered entrance rather than a true shared element. Revisit when Reanimated re-enables the API.
- **Android glass blur:** iOS renders full BlurView backdrop blur. On Android, expo-blur's `dimezisBlurView` needs a `blurTarget` to capture the content behind the surface; without that per-screen wiring it gracefully falls back to the translucent frosted fill + hairline + highlight (no live backdrop blur). Wiring `BlurTargetView` per screen would restore it.
- **Reduce Motion** is honored, but `useReducedMotion()` is read at app launch — toggling the OS setting mid-session takes effect on next launch.
- **Offline:** network failures surface a retry card; a live connectivity banner would need `@react-native-community/netinfo` (out of scope for v1).
- **"Where to watch"** uses TMDB's `watch/providers` (region US, falling back to any available); it lists providers, not deep links.

## Scripts

```bash
npx expo start      # dev server
npm run android     # / npm run ios / npm run web
npm run lint        # expo lint (clean)
npx tsc --noEmit    # type check (clean)
```
