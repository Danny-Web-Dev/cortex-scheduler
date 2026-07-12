import { useTranslation } from 'react-i18next';
import { useSearchBarContext } from '@/state/search';
import { SearchResultGroup } from './SearchResultGroup';

export const SearchDropdown = () => {
  const { t } = useTranslation();
  const { term, open, data, enabled, showEmpty, highlightedId, pickSpecialty, pickDoctor } =
    useSearchBarContext();

  if (!open || !enabled) return null;
  if (!data && !showEmpty) return null;
  return (
    <div
      id="search-results"
      role="listbox"
      className="surface-bordered absolute z-20 mt-2 w-full overflow-hidden shadow-lg"
    >
      {showEmpty && <p className="px-4 py-3 text-subtitle">{t('search.empty', { term })}</p>}

      {data && data.specialties.length > 0 && (
        <SearchResultGroup
          label={t('search.specialties')}
          items={data.specialties}
          keyOf={(s) => s.id}
          highlightedId={highlightedId}
          onPick={pickSpecialty}
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
          highlightedId={highlightedId}
          onPick={pickDoctor}
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
  );
};
