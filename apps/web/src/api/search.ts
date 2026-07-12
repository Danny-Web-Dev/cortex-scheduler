import { SearchResultSchema, type SearchResult } from '@cortex/shared';
import { apiFetch } from './http';
import { ENDPOINTS } from './endpoints';

export const search = {
  query: async (q: string): Promise<SearchResult> => {
    const data = await apiFetch<unknown>(ENDPOINTS.search.query(q), { auth: false });
    return SearchResultSchema.parse(data);
  },
};
