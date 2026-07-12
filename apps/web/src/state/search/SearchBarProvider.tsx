import type { ReactNode } from 'react';
import { useSearchDropdown } from '@/hooks/search';
import { createRequiredContext } from '../createRequiredContext';

type SearchBarContextValue = ReturnType<typeof useSearchDropdown>;

const [SearchBarContext, useSearchBarContext] =
  createRequiredContext<SearchBarContextValue>('useSearchBarContext');

export { useSearchBarContext };

type SearchBarProviderProps = {
  children: ReactNode;
};

export const SearchBarProvider = ({ children }: SearchBarProviderProps) => {
  const dropdown = useSearchDropdown();

  return <SearchBarContext.Provider value={dropdown}>{children}</SearchBarContext.Provider>;
};
