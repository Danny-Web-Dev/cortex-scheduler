import { createContext, useContext } from 'react';

// Every feature provider (OtpLoginProvider, ConfirmHoldProvider, ...) pairs a
// Context with a hook that throws outside its provider — built once here
// instead of hand-rolled per provider.
export const createRequiredContext = <T,>(hookName: string) => {
  const Context = createContext<T | null>(null);

  const useRequiredContext = (): T => {
    const value = useContext(Context);
    if (!value) throw new Error(`${hookName} must be used within its provider`);
    return value;
  };

  return [Context, useRequiredContext] as const;
};
