/**
 * Optional OMDb enrichment — pulls the "IMDB feel" ratings for the detail
 * screen. Disabled (no-op) unless EXPO_PUBLIC_OMDB_KEY is set. Failures are
 * swallowed so OMDb never blocks the main TMDB detail.
 */
const KEY = process.env.EXPO_PUBLIC_OMDB_KEY;

export const omdbEnabled = !!KEY;

export interface OmdbRating {
  Source: string;
  Value: string;
}

export interface OmdbResponse {
  Response: string;
  imdbRating?: string;
  Metascore?: string;
  Ratings?: OmdbRating[];
  Error?: string;
}

const OMDB_TIMEOUT_MS = 5000;

export async function fetchOmdb(imdbId: string, signal?: AbortSignal): Promise<OmdbResponse | null> {
  if (!KEY || !imdbId) return null;

  // Bound the request so a slow/hung OMDb endpoint can't keep the enrichment
  // query pending forever, and chain the caller's signal (unmount/navigation).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OMDB_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort);
  }

  try {
    const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(KEY)}&i=${encodeURIComponent(imdbId)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const body = (await res.json()) as OmdbResponse;
    if (body?.Response === 'False') return null;
    return body;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
