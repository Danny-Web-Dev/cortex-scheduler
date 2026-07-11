import { SearchResultSchema, type SearchResult } from '@cortex/shared';
import { apiFetch } from '@/lib';

export const searchCatalog = async (q: string): Promise<SearchResult> => {
  const data = await apiFetch<unknown>(`/search?q=${encodeURIComponent(q)}`, { auth: false });
  return SearchResultSchema.parse(data);
};
