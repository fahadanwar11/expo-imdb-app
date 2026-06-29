/**
 * The single mapping layer between data sources and the app. Everything else
 * speaks `Title` / `TitleDetail`. Swap TMDB later → only this file changes.
 */
import { backdropUrl, logoUrl, posterUrl, profileUrl } from '@/lib/images';
import type { OmdbResponse } from '@/lib/omdb';
import type {
  TmdbDetail,
  TmdbListItem,
  TmdbVideo,
  TmdbWatchProviders,
} from '@/lib/tmdb';
import type {
  CastMember,
  ExternalRatings,
  MediaType,
  Title,
  TitleDetail,
  WatchProvider,
} from '@/types';

function yearOf(date?: string): string | undefined {
  return date && date.length >= 4 ? date.slice(0, 4) : undefined;
}

/** Map a raw list item to `Title`. Returns null for `person` / unknown media. */
export function toTitle(item: TmdbListItem, fallback?: MediaType): Title | null {
  if (item.media_type === 'person') return null;
  const mediaType: MediaType | undefined =
    item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : fallback;
  if (!mediaType) return null;

  return {
    id: item.id,
    mediaType,
    title: item.title ?? item.name ?? 'Untitled',
    year: yearOf(item.release_date ?? item.first_air_date),
    poster: posterUrl(item.poster_path),
    backdrop: backdropUrl(item.backdrop_path),
    rating: item.vote_average ?? 0,
    voteCount: item.vote_count ?? 0,
    genreIds: item.genre_ids ?? [],
    overview: item.overview ?? '',
  };
}

export function toTitles(items: TmdbListItem[] | undefined, fallback?: MediaType): Title[] {
  return (items ?? [])
    .map((item) => toTitle(item, fallback))
    .filter((t): t is Title => t !== null);
}

/** Best YouTube trailer key, preferring official trailers. */
export function pickTrailer(videos?: TmdbVideo[]): string | undefined {
  const yt = (videos ?? []).filter((v) => v.site === 'YouTube');
  const best =
    yt.find((v) => v.type === 'Trailer' && v.official) ??
    yt.find((v) => v.type === 'Trailer') ??
    yt.find((v) => v.type === 'Teaser') ??
    yt[0];
  return best?.key;
}

/** Streaming ("flatrate") providers for a region, falling back to any region. */
export function pickProviders(wp?: TmdbWatchProviders, region = 'US'): WatchProvider[] {
  const results = wp?.results;
  if (!results) return [];
  const entry = results[region] ?? Object.values(results)[0];
  return (entry?.flatrate ?? []).map((p) => ({
    providerId: p.provider_id,
    providerName: p.provider_name,
    logo: logoUrl(p.logo_path),
  }));
}

export function toTitleDetail(d: TmdbDetail, mediaType: MediaType): TitleDetail {
  const base = toTitle({ ...d, media_type: mediaType }, mediaType)!;
  const runtime =
    d.runtime ?? (d.episode_run_time && d.episode_run_time[0]) ?? undefined;

  const cast: CastMember[] = (d.credits?.cast ?? [])
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character || undefined,
      profile: profileUrl(c.profile_path),
    }));

  return {
    ...base,
    tagline: d.tagline || undefined,
    runtime: runtime ?? undefined,
    status: d.status || undefined,
    genres: d.genres ?? [],
    cast,
    trailerKey: pickTrailer(d.videos?.results),
    recommendations: toTitles(d.recommendations?.results),
    watchProviders: pickProviders(d['watch/providers']),
    imdbId: d.imdb_id ?? d.external_ids?.imdb_id ?? undefined,
    originalLanguage: d.original_language,
  };
}

const clean = (v?: string): string | undefined => (v && v !== 'N/A' ? v : undefined);

export function mapExternalRatings(o: OmdbResponse): ExternalRatings {
  const rt = o.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value;
  return {
    imdb: clean(o.imdbRating),
    rottenTomatoes: clean(rt),
    metascore: clean(o.Metascore),
  };
}
