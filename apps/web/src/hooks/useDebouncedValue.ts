import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 250;

export const useDebouncedValue = <T,>(value: T, delayMs = DEFAULT_DELAY_MS): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
};
