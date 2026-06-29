/**
 * TMDB image URL composition. UI never stores raw paths — always compose here.
 * Reference: https://image.tmdb.org/t/p/{size}{path}
 */

const IMG_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';
export type LogoSize = 'w45' | 'w92' | 'w154' | 'w185' | 'original';

function compose(path: string | null | undefined, size: string): string | undefined {
  if (!path) return undefined;
  return `${IMG_BASE}/${size}${path}`;
}

/** Posters: grids use w185, cards w342, detail w500. */
export const posterUrl = (path?: string | null, size: PosterSize = 'w342') => compose(path, size);
/** Backdrops: hero/detail use w780, full-bleed uses w1280. */
export const backdropUrl = (path?: string | null, size: BackdropSize = 'w780') => compose(path, size);
export const profileUrl = (path?: string | null, size: ProfileSize = 'w185') => compose(path, size);
export const logoUrl = (path?: string | null, size: LogoSize = 'w92') => compose(path, size);
