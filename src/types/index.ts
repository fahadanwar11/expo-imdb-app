/**
 * Normalized domain types. The rest of the app speaks ONLY these shapes —
 * `lib/imdbAdapter.ts` maps TMDB (and optional OMDb) responses into them, so
 * swapping the data source later only touches the adapter.
 */

export type MediaType = 'movie' | 'tv';

/** The core list/card shape used across rails, grids, search and wishlist. */
export type Title = {
  id: number;
  mediaType: MediaType;
  title: string;
  /** 4-digit year as a string, e.g. "1999". Undefined when unknown. */
  year?: string;
  /** Fully composed image URLs — never raw TMDB paths. */
  poster?: string;
  backdrop?: string;
  /** TMDB vote_average, 0–10. */
  rating: number;
  voteCount: number;
  genreIds: number[];
  overview: string;
};

export type Genre = { id: number; name: string };

export type CastMember = {
  id: number;
  name: string;
  character?: string;
  /** Composed profile image URL. */
  profile?: string;
};

export type Video = {
  key: string;
  name: string;
  site: string;
  type: string;
};

export type WatchProvider = {
  providerId: number;
  providerName: string;
  logo?: string;
};

/** Optional "IMDB feel" ratings pulled from OMDb on the detail screen. */
export type ExternalRatings = {
  imdb?: string; // e.g. "8.5"
  rottenTomatoes?: string; // e.g. "92%"
  metascore?: string; // e.g. "85"
};

/** Full detail shape for `title/[id]`. Extends the list `Title`. */
export type TitleDetail = Title & {
  tagline?: string;
  /** Minutes. For TV this is the (first) episode runtime. */
  runtime?: number;
  status?: string;
  genres: Genre[];
  cast: CastMember[];
  /** YouTube key of the primary trailer, if any. */
  trailerKey?: string;
  recommendations: Title[];
  watchProviders: WatchProvider[];
  imdbId?: string;
  originalLanguage?: string;
};

/* ---- Filters (Search + Discover) ---- */

export type SortKey = 'popularity' | 'rating' | 'release';
export type TypeFilter = 'all' | 'movie' | 'tv';

export type Filters = {
  /** Selected genre ids (multi-select). */
  genreIds: number[];
  /** 0–10, maps to TMDB vote_average.gte. 0 = no minimum. */
  minRating: number;
  /** Single release year. Undefined = any. */
  year?: number;
  type: TypeFilter;
  sort: SortKey;
};

/** A page of titles returned by the data layer (for infinite queries). */
export type TitlePage = {
  titles: Title[];
  page: number;
  totalPages: number;
};
