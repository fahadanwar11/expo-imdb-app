import { useQuery } from '@tanstack/react-query';

import { tmdb } from '@/lib/tmdb';
import type { Genre } from '@/types';

export type GenreData = {
  /** Sorted, de-duplicated genres across movie + tv. */
  genres: Genre[];
  /** id → name lookup for rendering genre chips on cards. */
  byId: Record<number, string>;
};

/** Movie + TV genres merged into one list + lookup map. Effectively static. */
export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    staleTime: Infinity,
    queryFn: async ({ signal }): Promise<GenreData> => {
      const [movie, tv] = await Promise.all([tmdb.genresMovie(signal), tmdb.genresTv(signal)]);
      const byId: Record<number, string> = {};
      for (const g of [...movie.genres, ...tv.genres]) byId[g.id] = g.name;
      const genres = Object.entries(byId)
        .map(([id, name]) => ({ id: Number(id), name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { genres, byId };
    },
  });
}
