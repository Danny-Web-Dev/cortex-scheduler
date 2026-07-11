import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';

// Keeps authenticated users off /login — except mid-registration (name not yet
// set), where /login still owns the required name step.
export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.name) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
