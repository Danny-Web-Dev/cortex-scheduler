import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui';
import { useSearchBarContext } from '@/state/search';

export const SearchInput = () => {
  const { t } = useTranslation();
  const { term, open, isFetching, highlightedId, onChange, onFocus, onBlur, onKeyDown } =
    useSearchBarContext();

  return (
    <>
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="search-results"
        aria-activedescendant={highlightedId ? `search-result-${highlightedId}` : undefined}
        value={term}
        placeholder={t('search.placeholder')}
        aria-label={t('search.inputLabel')}
        onChange={(e) => onChange(e.target.value)}
        onFocusCapture={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="surface-bordered px-4 py-2.5 pr-10 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {isFetching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500">
          <Spinner size="sm" />
        </span>
      )}
    </>
  );
};
