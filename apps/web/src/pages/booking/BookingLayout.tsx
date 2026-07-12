import { Outlet } from 'react-router-dom';
import { BookingStepper } from '@/components/booking';

export const BookingLayout = () => (
  <div className="space-y-8">
    <BookingStepper />
    <Outlet />
  </div>
);
