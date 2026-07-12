import { useState, type FormEvent } from 'react';

// The phone/code/name steps each pair a single text value with a submit
// handler that trims it and reports back a validation error string — shared
// here instead of repeating the same two useState + handleSubmit per step.
export const useStepForm = (submit: (value: string) => string | null, initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(submit(value.trim()));
  };

  return { value, setValue, localError, handleSubmit };
};
