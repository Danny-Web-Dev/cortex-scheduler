import { Outlet } from 'react-router-dom';
import { HoldToast } from '@/features/booking';
import { AppHeader } from './AppHeader';

export const AppLayout = () => (
  <div className="min-h-full">
    <AppHeader />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Outlet />
    </main>
    <HoldToast />
  </div>
);
