import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib';

const STALE_MS = 30_000;
const MAX_RETRIES = 1;

// Don't retry client errors (4xx) — only transient failures.
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
