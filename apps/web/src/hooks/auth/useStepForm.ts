import { useState, type FormEvent } from 'react';

export const useStepForm = (submit: (value: string) => string | null, initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(submit(value.trim()));
  };

  return { value, setValue, localError, handleSubmit };
};
