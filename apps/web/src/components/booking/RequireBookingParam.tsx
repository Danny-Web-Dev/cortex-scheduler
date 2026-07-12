import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/config';

type RequireBookingParamProps = {
  param: string;
  children: ReactNode;
};

// Guards a booking step that depends on an earlier step's query param —
// missing it means the flow was entered out of order, so restart at specialty.
export const RequireBookingParam = ({ param, children }: RequireBookingParamProps) => {
  const [params] = useSearchParams();
  if (!params.get(param)) return <Navigate to={ROUTES.book.specialty} replace />;
  return <>{children}</>;
};
