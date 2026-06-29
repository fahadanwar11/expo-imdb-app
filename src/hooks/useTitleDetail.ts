import { useQuery } from '@tanstack/react-query';

import { mapExternalRatings, toTitleDetail } from '@/lib/imdbAdapter';
import { fetchOmdb, omdbEnabled } from '@/lib/omdb';
import { tmdb } from '@/lib/tmdb';
import type { ExternalRatings, MediaType, TitleDetail } from '@/types';

/** Full TMDB title detail. Renders immediately — OMDb is fetched separately. */
export function useTitleDetail(mediaType: MediaType, id: number) {
  return useQuery({
    queryKey: ['detail', mediaType, id],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: async ({ signal }): Promise<TitleDetail> => {
      const raw = await tmdb.detail(mediaType, id, signal);
      return toTitleDetail(raw, mediaType);
    },
  });
}

/**
 * Optional OMDb enrichment as a dependent query so it NEVER blocks the TMDB
 * detail render — ratings stream in once available (§3.3).
 */
export function useExternalRatings(imdbId: string | undefined) {
  return useQuery({
    queryKey: ['external-ratings', imdbId],
    enabled: omdbEnabled && !!imdbId,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async ({ signal }): Promise<ExternalRatings | null> => {
      const omdb = await fetchOmdb(imdbId as string, signal);
      return omdb ? mapExternalRatings(omdb) : null;
    },
  });
}
