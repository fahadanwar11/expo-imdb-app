import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient. 5-min staleTime keeps rails from refetching on every
 * focus (§4); 30-min gcTime keeps cached pages around for back-navigation.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
