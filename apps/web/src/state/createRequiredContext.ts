import { createContext, useContext } from 'react';

export const createRequiredContext = <T,>(hookName: string) => {
  const Context = createContext<T | null>(null);

  const useRequiredContext = (): T => {
    const value = useContext(Context);
    if (!value) throw new Error(`${hookName} must be used within its provider`);
    return value;
  };

  return [Context, useRequiredContext] as const;
};
