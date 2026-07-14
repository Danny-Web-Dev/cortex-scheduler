import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/config';
import { useAuth } from '@/hooks';

export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.name) return <Navigate to={ROUTES.dashboard} replace />;
  return <Outlet />;
};
