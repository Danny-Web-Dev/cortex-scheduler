import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { AppointmentsPage } from '@/features/appointments';
import {
  BookingLayout,
  ConfirmStep,
  DoctorStep,
  SlotStep,
  SpecialtyStep,
} from '@/features/booking';
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
          {
            path: '/book',
            element: <BookingLayout />,
            children: [
              { index: true, element: <Navigate to="/book/specialty" replace /> },
              { path: 'specialty', element: <SpecialtyStep /> },
              { path: 'doctor', element: <DoctorStep /> },
              { path: 'slot', element: <SlotStep /> },
              { path: 'confirm', element: <ConfirmStep /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
