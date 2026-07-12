import { createContext, useContext, type ReactNode } from 'react';
import { useSearchDropdown } from './useSearchDropdown';

type SearchBarContextValue = ReturnType<typeof useSearchDropdown>;

const SearchBarContext = createContext<SearchBarContextValue | null>(null);

export const useSearchBarContext = () => {
  const value = useContext(SearchBarContext);
  if (!value) throw new Error('useSearchBarContext must be used within SearchBarProvider');
  return value;
};

type SearchBarProviderProps = {
  children: ReactNode;
};

export const SearchBarProvider = ({ children }: SearchBarProviderProps) => {
  const dropdown = useSearchDropdown();

  return <SearchBarContext.Provider value={dropdown}>{children}</SearchBarContext.Provider>;
};
