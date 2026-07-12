import { SearchResultSchema, type SearchResult } from '@cortex/shared';
import { apiFetch } from '../../config/network/http.ts';
import { ENDPOINTS } from '../../config/network/endpoints.ts';

export const search = {
  query: async (q: string): Promise<SearchResult> => {
    const data = await apiFetch<unknown>(ENDPOINTS.search.query(q), { auth: false });
    return SearchResultSchema.parse(data);
  },
};
