import { createContext, useContext, type ReactNode } from 'react';
import { useOtpLogin } from '@/hooks/auth';

type OtpLoginContextValue = ReturnType<typeof useOtpLogin>;

const OtpLoginContext = createContext<OtpLoginContextValue | null>(null);

export const useOtpLoginContext = () => {
  const value = useContext(OtpLoginContext);
  if (!value) throw new Error('useOtpLoginContext must be used within OtpLoginProvider');
  return value;
};

type OtpLoginProviderProps = {
  children: ReactNode;
};

// Single owner of the phone → code → name state machine; the login units
// read it through context instead of props.
export const OtpLoginProvider = ({ children }: OtpLoginProviderProps) => {
  const login = useOtpLogin();

  return <OtpLoginContext.Provider value={login}>{children}</OtpLoginContext.Provider>;
};
