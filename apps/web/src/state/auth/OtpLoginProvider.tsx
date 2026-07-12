import type { ReactNode } from 'react';
import { useOtpLogin } from '@/hooks/auth';
import { createRequiredContext } from '../createRequiredContext';

type OtpLoginContextValue = ReturnType<typeof useOtpLogin>;

const [OtpLoginContext, useOtpLoginContext] =
  createRequiredContext<OtpLoginContextValue>('useOtpLoginContext');

export { useOtpLoginContext };

type OtpLoginProviderProps = {
  children: ReactNode;
};

// Single owner of the phone → code → name state machine; the login units
// read it through context instead of props.
export const OtpLoginProvider = ({ children }: OtpLoginProviderProps) => {
  const login = useOtpLogin();

  return <OtpLoginContext.Provider value={login}>{children}</OtpLoginContext.Provider>;
};
