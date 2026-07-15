import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/config';

type RequireBookingParamProps = {
  param: string;
  children: ReactNode;
};

export const RequireBookingParam = ({ param, children }: RequireBookingParamProps) => {
  const [params] = useSearchParams();
  if (!params.get(param)) return <Navigate to={ROUTES.book.specialty} replace />;
  return <>{children}</>;
};
