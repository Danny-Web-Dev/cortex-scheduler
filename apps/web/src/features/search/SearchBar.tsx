import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { useCatalogSearch } from './useCatalogSearch';

export const SearchBar = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { data, isFetching, enabled } = useCatalogSearch(term);

  const hasResults = Boolean(data && (data.specialties.length > 0 || data.doctors.length > 0));
  const showEmpty = enabled && !isFetching && data && !hasResults;

  // Delay close so a click on a result registers before blur hides the list.
  const onBlur = () => {
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const go = (path: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(false);
    setTerm('');
    navigate(path);
  };

  return (
    <div className="relative">
      <input
        type="search"
        value={term}
        placeholder="Search specialties or doctors…"
        aria-label="Search specialties or doctors"
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocusCapture={() => setOpen(true)}
        onBlur={onBlur}
        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 pr-10 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {isFetching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500">
          <Spinner size="sm" />
        </span>
      )}

      {open && enabled && (data || showEmpty) && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg">
          {showEmpty && <p className="px-4 py-3 text-sm text-ink-500">No matches for “{term}”.</p>}

          {data && data.specialties.length > 0 && (
            <div className="border-b border-ink-100">
              <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Specialties
              </p>
              {data.specialties.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(`/book/doctor?specialtyId=${s.id}`)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-brand-50"
                >
                  <span className="font-medium text-ink-900">{s.name}</span>
                  <span className="ml-2 text-ink-400">{s.description}</span>
                </button>
              ))}
            </div>
          )}

          {data && data.doctors.length > 0 && (
            <div>
              <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Doctors
              </p>
              {data.doctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(`/book/slot?specialtyId=${d.specialtyId}&doctorId=${d.id}`)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-brand-50"
                >
                  <span className="font-medium text-ink-900">{d.name}</span>
                  <span className="ml-2 text-ink-400">
                    {d.specialtyName} · ★ {d.rating.toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
