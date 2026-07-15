import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api';

const STALE_MS = 30_000;
const MAX_RETRIES = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < MAX_RETRIES;
      },
    },
    mutations: { retry: false },
  },
});
