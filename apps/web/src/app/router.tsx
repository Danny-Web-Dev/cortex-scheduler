import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { AppointmentsPage } from '@/pages/appointments';
import { BookingLayout, ConfirmStep, DoctorStep, SlotStep, SpecialtyStep } from '@/pages/booking';
import { ROUTES, BOOK_STEP_SEGMENT } from '@/config';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.appointments, element: <AppointmentsPage /> },
          {
            path: ROUTES.book.root,
            element: <BookingLayout />,
            children: [
              { index: true, element: <Navigate to={ROUTES.book.specialty} replace /> },
              { path: BOOK_STEP_SEGMENT.specialty, element: <SpecialtyStep /> },
              { path: BOOK_STEP_SEGMENT.doctor, element: <DoctorStep /> },
              { path: BOOK_STEP_SEGMENT.slot, element: <SlotStep /> },
              { path: BOOK_STEP_SEGMENT.confirm, element: <ConfirmStep /> },
            ],
          },
        ],
      },
    ],
  },
  { path: ROUTES.root, element: <Navigate to={ROUTES.dashboard} replace /> },
  { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
]);
