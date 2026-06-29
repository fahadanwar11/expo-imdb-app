/**
 * Infinite-query hooks for the Discover rails, multi-search, and filtered
 * discover. Each returns `data` already normalized to `Title[]` (via `select`),
 * plus the usual react-query paging fields (fetchNextPage, hasNextPage, …).
 */
import { useInfiniteQuery } from '@tanstack/react-query';

import { toTitles } from '@/lib/imdbAdapter';
import { tmdb, type DiscoverParams, type TmdbListResponse } from '@/lib/tmdb';
import type { Filters, MediaType, SortKey, Title } from '@/types';

type ListFetcher = (page: number, signal?: AbortSignal) => Promise<TmdbListResponse>;

function nextPage(last: { page: number; total_pages: number }): number | undefined {
  return last.page < last.total_pages && last.page < 500 ? last.page + 1 : undefined;
}

/**
 * Drop titles already seen earlier in the list. TMDB's popularity/trending
 * endpoints re-rank between page requests, so the same id can appear on
 * adjacent pages — without this, FlatList gets duplicate keys.
 */
function dedupe(titles: Title[]): Title[] {
  const seen = new Set<string>();
  const out: Title[] = [];
  for (const t of titles) {
    const key = `${t.mediaType}-${t.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

/** Shared infinite query for a standard TMDB list endpoint. */
function useTitleRail(key: string, fetcher: ListFetcher, fallback?: MediaType) {
  return useInfiniteQuery({
    queryKey: ['rail', key],
    queryFn: ({ pageParam, signal }) => fetcher(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPage(last),
    select: (data) => dedupe(data.pages.flatMap((p) => toTitles(p.results, fallback))),
  });
}

export const useTrendingAll = () => useTitleRail('trending-all', tmdb.trendingAll);
export const usePopularMovies = () => useTitleRail('movie-popular', tmdb.moviePopular, 'movie');
export const useTopRatedMovies = () => useTitleRail('movie-top-rated', tmdb.movieTopRated, 'movie');
export const useTrendingTv = () => useTitleRail('trending-tv', tmdb.trendingTv, 'tv');
export const useNowPlaying = () => useTitleRail('movie-now-playing', tmdb.movieNowPlaying, 'movie');
export const useAiringToday = () => useTitleRail('tv-airing-today', tmdb.tvAiringToday, 'tv');

/** Debounced multi-search. `query` should already be debounced by the caller. */
export function useSearch(query: string) {
  const q = query.trim();
  return useInfiniteQuery({
    queryKey: ['search', q],
    enabled: q.length > 0,
    queryFn: ({ pageParam, signal }) => tmdb.searchMulti(q, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPage(last),
    select: (data) => dedupe(data.pages.flatMap((p) => toTitles(p.results))),
  });
}

/* ---------- Filtered discover ---------- */

function sortToTmdb(sort: SortKey, isTv: boolean): string {
  switch (sort) {
    case 'rating':
      return 'vote_average.desc';
    case 'release':
      return isTv ? 'first_air_date.desc' : 'primary_release_date.desc';
    default:
      return 'popularity.desc';
  }
}

function buildDiscoverParams(f: Filters, isTv: boolean): DiscoverParams {
  const params: DiscoverParams = {
    sort_by: sortToTmdb(f.sort, isTv),
    include_adult: false,
  };
  if (f.genreIds.length) params.with_genres = f.genreIds.join(',');
  if (f.minRating > 0) {
    params['vote_average.gte'] = f.minRating;
    // Require a vote floor so rating/release sorts don't surface obscure 10.0s.
    params['vote_count.gte'] = 50;
  }
  if (f.sort === 'rating') params['vote_count.gte'] = 200;
  if (f.sort === 'release') {
    // Cap at today so "Newest" doesn't surface unreleased, metadata-only titles.
    const today = new Date().toISOString().slice(0, 10);
    params[isTv ? 'first_air_date.lte' : 'primary_release_date.lte'] = today;
  }
  if (f.year) params[isTv ? 'first_air_date_year' : 'primary_release_year'] = f.year;
  return params;
}

type DiscoverPageParam = { page: number; movieTotal: number; tvTotal: number };
type DiscoverPage = { page: number; movieTotal: number; tvTotal: number; titles: Title[] };

/**
 * Discover with filters. For type 'all', movie + tv are fetched per page and
 * concatenated. Per-source page totals are carried through the page param so an
 * exhausted source is no longer queried once it runs out. `enabled` gates it.
 */
export function useDiscover(filters: Filters, enabled: boolean) {
  // Sources not requested by the type filter start "exhausted" (total 0).
  const initialPageParam: DiscoverPageParam = {
    page: 1,
    movieTotal: filters.type === 'tv' ? 0 : Infinity,
    tvTotal: filters.type === 'movie' ? 0 : Infinity,
  };

  return useInfiniteQuery({
    queryKey: ['discover', filters],
    enabled,
    initialPageParam,
    queryFn: async ({ pageParam, signal }): Promise<DiscoverPage> => {
      const wantMovie = pageParam.page <= pageParam.movieTotal;
      const wantTv = pageParam.page <= pageParam.tvTotal;
      const [mv, tv] = await Promise.all([
        wantMovie
          ? tmdb.discoverMovie({ ...buildDiscoverParams(filters, false), page: pageParam.page }, signal)
          : null,
        wantTv
          ? tmdb.discoverTv({ ...buildDiscoverParams(filters, true), page: pageParam.page }, signal)
          : null,
      ]);
      return {
        page: pageParam.page,
        // Carry forward a source's known total when it was skipped this page.
        movieTotal: mv?.total_pages ?? pageParam.movieTotal,
        tvTotal: tv?.total_pages ?? pageParam.tvTotal,
        titles: [...toTitles(mv?.results, 'movie'), ...toTitles(tv?.results, 'tv')],
      };
    },
    getNextPageParam: (last): DiscoverPageParam | undefined => {
      const next = last.page + 1;
      if (next > 500) return undefined;
      const more = next <= last.movieTotal || next <= last.tvTotal;
      return more ? { page: next, movieTotal: last.movieTotal, tvTotal: last.tvTotal } : undefined;
    },
    select: (data) => dedupe(data.pages.flatMap((p) => p.titles)),
  });
}
