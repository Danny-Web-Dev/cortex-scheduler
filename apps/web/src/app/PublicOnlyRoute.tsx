import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';

// Keeps authenticated users off /login.
export const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
