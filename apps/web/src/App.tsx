import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/state/toast';
import { queryClient } from '@/config';
import { router } from './app/router';
import { RootGate } from './app/RootGate';

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <RootGate>
        <RouterProvider router={router} />
      </RootGate>
    </ToastProvider>
  </QueryClientProvider>
);
