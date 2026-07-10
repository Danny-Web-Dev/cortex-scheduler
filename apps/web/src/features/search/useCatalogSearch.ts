import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { SEARCH_MIN_LENGTH } from '@cortex/shared';
import { queryKeys, searchCatalog } from '@/lib';
import { useDebouncedValue } from '@/hooks';

// Debounced smart search over specialties + doctors. Keeps previous results
// visible while the next query loads so the dropdown doesn't flash empty.
export const useCatalogSearch = (term: string) => {
  const debounced = useDebouncedValue(term.trim());
  const enabled = debounced.length >= SEARCH_MIN_LENGTH;

  const query = useQuery({
    queryKey: queryKeys.search(debounced),
    queryFn: () => searchCatalog(debounced),
    enabled,
    placeholderData: keepPreviousData,
  });

  return { ...query, enabled, term: debounced };
};
