import { Outlet } from 'react-router-dom';
import { BookingStepper } from './BookingStepper';

export const BookingLayout = () => (
  <div className="space-y-8">
    <BookingStepper />
    <Outlet />
  </div>
);
