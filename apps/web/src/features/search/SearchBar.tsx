import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui';
import { useSearchDropdown } from './useSearchDropdown';
import { SearchResultGroup } from './SearchResultGroup';

export const SearchBar = () => {
  const { t } = useTranslation();
  const { term, open, data, isFetching, enabled, showEmpty, onChange, onFocus, onBlur, go } =
    useSearchDropdown();

  return (
    <div className="relative">
      <input
        type="search"
        value={term}
        placeholder={t('search.placeholder')}
        aria-label="Search specialties or doctors"
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

      {open && enabled && (data || showEmpty) && (
        <div className="surface-bordered absolute z-20 mt-2 w-full overflow-hidden shadow-lg">
          {showEmpty && <p className="px-4 py-3 text-subtitle">{t('search.empty', { term })}</p>}

          {data && data.specialties.length > 0 && (
            <SearchResultGroup
              label={t('search.specialties')}
              items={data.specialties}
              keyOf={(s) => s.id}
              onPick={(s) => go(`/book/doctor?specialtyId=${s.id}`)}
              className="border-b border-ink-100"
              renderItem={(s) => (
                <>
                  <span className="font-medium text-ink-900">{s.name}</span>
                  <span className="ml-2 text-ink-400">{s.description}</span>
                </>
              )}
            />
          )}

          {data && data.doctors.length > 0 && (
            <SearchResultGroup
              label={t('search.doctors')}
              items={data.doctors}
              keyOf={(d) => d.id}
              onPick={(d) => go(`/book/slot?specialtyId=${d.specialtyId}&doctorId=${d.id}`)}
              renderItem={(d) => (
                <>
                  <span className="font-medium text-ink-900">{d.name}</span>
                  <span className="ml-2 text-ink-400">
                    {t('search.doctorSubtitle', {
                      specialtyName: d.specialtyName,
                      rating: d.rating.toFixed(1),
                    })}
                  </span>
                </>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};
