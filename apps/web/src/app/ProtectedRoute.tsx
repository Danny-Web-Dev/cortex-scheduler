import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/config';
import { useAuth } from '@/hooks';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;
  // Registration isn't done until a name is set — send them back to finish it.
  if (user && !user.name) return <Navigate to={ROUTES.login} replace />;
  return <Outlet />;
};
