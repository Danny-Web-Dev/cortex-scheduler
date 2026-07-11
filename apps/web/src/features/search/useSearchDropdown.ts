import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogSearch } from './useCatalogSearch';

const BLUR_CLOSE_DELAY_MS = 150;

export const useSearchDropdown = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { data, isFetching, enabled } = useCatalogSearch(term);

  const hasResults = Boolean(data && (data.specialties.length > 0 || data.doctors.length > 0));
  const showEmpty = enabled && !isFetching && Boolean(data) && !hasResults;

  const onChange = (value: string) => {
    setTerm(value);
    setOpen(true);
  };

  const onFocus = () => setOpen(true);

  // Delay close so a click on a result registers before blur hides the list.
  const onBlur = () => {
    blurTimer.current = setTimeout(() => setOpen(false), BLUR_CLOSE_DELAY_MS);
  };

  const go = (path: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(false);
    setTerm('');
    navigate(path);
  };

  return { term, open, data, isFetching, enabled, showEmpty, onChange, onFocus, onBlur, go };
};
