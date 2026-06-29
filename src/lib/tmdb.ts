/**
 * Typed TMDB API v3 client. Endpoint helpers return RAW TMDB JSON; the
 * `imdbAdapter` normalizes those into the app's `Title` shape. Auth uses the
 * v3 `api_key` query param from `EXPO_PUBLIC_TMDB_KEY`.
 */
import type { MediaType } from '@/types';

const BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.EXPO_PUBLIC_TMDB_KEY;

export class TmdbError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
  }
}

export const MISSING_KEY_MESSAGE =
  'Missing TMDB API key. Copy .env.example to .env and set EXPO_PUBLIC_TMDB_KEY, then restart the dev server.';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildQuery(params: QueryParams): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

async function tmdbFetch<T>(path: string, params: QueryParams = {}, signal?: AbortSignal): Promise<T> {
  if (!KEY) throw new TmdbError(MISSING_KEY_MESSAGE);
  const url = `${BASE}${path}${buildQuery({ api_key: KEY, ...params })}`;
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new TmdbError('Network error — check your connection and try again.');
  }
  if (!res.ok) {
    let message = `TMDB request failed (${res.status})`;
    try {
      const body = (await res.json()) as { status_message?: string };
      if (body?.status_message) message = body.status_message;
    } catch {
      /* ignore parse errors */
    }
    if (res.status === 401) message = 'Invalid TMDB API key. Check EXPO_PUBLIC_TMDB_KEY in your .env.';
    throw new TmdbError(message, res.status);
  }
  return (await res.json()) as T;
}

/* ---------- Raw TMDB response types ---------- */

export type TmdbMediaType = 'movie' | 'tv' | 'person';

export interface TmdbListItem {
  id: number;
  media_type?: TmdbMediaType;
  title?: string; // movie
  name?: string; // tv / person
  release_date?: string; // movie
  first_air_date?: string; // tv
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null; // person
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  overview?: string;
  original_language?: string;
}

export interface TmdbListResponse {
  page: number;
  results: TmdbListItem[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}
export interface TmdbGenreResponse {
  genres: TmdbGenre[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
}

export interface TmdbVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

export interface TmdbWatchProviders {
  results?: Record<
    string,
    { link?: string; flatrate?: TmdbProvider[]; rent?: TmdbProvider[]; buy?: TmdbProvider[] }
  >;
}

export interface TmdbDetail extends TmdbListItem {
  runtime?: number | null; // movie
  episode_run_time?: number[]; // tv
  genres?: TmdbGenre[];
  tagline?: string;
  status?: string;
  imdb_id?: string | null; // movie detail
  external_ids?: { imdb_id?: string | null };
  credits?: { cast?: TmdbCastMember[] };
  videos?: { results?: TmdbVideo[] };
  recommendations?: TmdbListResponse;
  'watch/providers'?: TmdbWatchProviders;
}

export type DiscoverParams = QueryParams;

/* ---------- Endpoint helpers ---------- */

export const tmdb = {
  trendingAll: (page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/trending/all/week', { page }, signal),
  trendingTv: (page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/trending/tv/week', { page }, signal),
  moviePopular: (page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/movie/popular', { page }, signal),
  movieTopRated: (page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/movie/top_rated', { page }, signal),
  movieNowPlaying: (page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/movie/now_playing', { page }, signal),
  tvAiringToday: (page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/tv/airing_today', { page }, signal),
  searchMulti: (query: string, page: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/search/multi', { query, page, include_adult: false }, signal),
  discoverMovie: (params: DiscoverParams, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/discover/movie', params, signal),
  discoverTv: (params: DiscoverParams, signal?: AbortSignal) =>
    tmdbFetch<TmdbListResponse>('/discover/tv', params, signal),
  genresMovie: (signal?: AbortSignal) => tmdbFetch<TmdbGenreResponse>('/genre/movie/list', {}, signal),
  genresTv: (signal?: AbortSignal) => tmdbFetch<TmdbGenreResponse>('/genre/tv/list', {}, signal),
  detail: (mediaType: MediaType, id: number, signal?: AbortSignal) =>
    tmdbFetch<TmdbDetail>(
      `/${mediaType}/${id}`,
      { append_to_response: 'credits,videos,recommendations,external_ids,watch/providers' },
      signal,
    ),
};
