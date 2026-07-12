import { SearchBarProvider } from './SearchBarProvider';
import { SearchInput } from './SearchInput';
import { SearchDropdown } from './SearchDropdown';

export const SearchBar = () => (
  <SearchBarProvider>
    <div className="relative">
      <SearchInput />
      <SearchDropdown />
    </div>
  </SearchBarProvider>
);
