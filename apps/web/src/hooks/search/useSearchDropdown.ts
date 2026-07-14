import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '@cortex/shared';
import { ROUTES } from '@/config';
import { useCatalogSearch } from '@/api/queries/search';

const BLUR_CLOSE_DELAY_MS = 150;
const NO_HIGHLIGHT = -1;

type FlatResult =
  | { kind: 'specialty'; id: string; item: SearchResult['specialties'][number] }
  | { kind: 'doctor'; id: string; item: SearchResult['doctors'][number] };

export const useSearchDropdown = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(NO_HIGHLIGHT);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { data, isFetching, enabled } = useCatalogSearch(term);

  const hasResults = Boolean(data && (data.specialties.length > 0 || data.doctors.length > 0));
  const showEmpty = enabled && !isFetching && Boolean(data) && !hasResults;

  const flatResults = useMemo<FlatResult[]>(() => {
    if (!data) return [];
    return [
      ...data.specialties.map((s) => ({ kind: 'specialty' as const, id: s.id, item: s })),
      ...data.doctors.map((d) => ({ kind: 'doctor' as const, id: d.id, item: d })),
    ];
  }, [data]);

  const highlightedId = flatResults[highlightedIndex]?.id ?? null;

  const go = (path: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(false);
    setTerm('');
    setHighlightedIndex(NO_HIGHLIGHT);
    navigate(path);
  };

  const pickSpecialty = (specialty: SearchResult['specialties'][number]) =>
    go(ROUTES.book.doctorWithSpecialty({ specialtyId: specialty.id }));

  const pickDoctor = (doctor: SearchResult['doctors'][number]) =>
    go(ROUTES.book.slotWithDoctor({ specialtyId: doctor.specialtyId, doctorId: doctor.id }));

  const pick = (result: FlatResult) => {
    if (result.kind === 'specialty') return pickSpecialty(result.item);
    return pickDoctor(result.item);
  };

  const onChange = (value: string) => {
    setTerm(value);
    setOpen(true);
    setHighlightedIndex(NO_HIGHLIGHT);
  };

  const onFocus = () => setOpen(true);

  const onBlur = () => {
    blurTimer.current = setTimeout(() => setOpen(false), BLUR_CLOSE_DELAY_MS);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % flatResults.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
      return;
    }
    if (e.key === 'Enter' && highlightedIndex !== NO_HIGHLIGHT) {
      e.preventDefault();
      const result = flatResults[highlightedIndex];
      if (result) pick(result);
    }
  };

  return {
    term,
    open,
    data,
    isFetching,
    enabled,
    showEmpty,
    highlightedId,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    pickSpecialty,
    pickDoctor,
  };
};
