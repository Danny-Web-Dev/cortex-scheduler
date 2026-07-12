import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui';
import { useSearchBarContext } from './SearchBarProvider';

export const SearchInput = () => {
  const { t } = useTranslation();
  const { term, isFetching, onChange, onFocus, onBlur } = useSearchBarContext();

  return (
    <>
      <input
        type="search"
        value={term}
        placeholder={t('search.placeholder')}
        aria-label={t('search.inputLabel')}
        onChange={(e) => onChange(e.target.value)}
        onFocusCapture={onFocus}
        onBlur={onBlur}
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
