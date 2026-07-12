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

export const OtpLoginProvider = ({ children }: OtpLoginProviderProps) => {
  const login = useOtpLogin();

  return <OtpLoginContext.Provider value={login}>{children}</OtpLoginContext.Provider>;
};
