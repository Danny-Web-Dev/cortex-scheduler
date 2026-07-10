import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { AppointmentsPage } from '@/features/appointments';
import { BookingPlaceholder } from '@/features/booking/BookingPlaceholder';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/appointments', element: <AppointmentsPage /> },
          { path: '/book/*', element: <BookingPlaceholder /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
