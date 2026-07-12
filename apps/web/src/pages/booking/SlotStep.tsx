import { Navigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/config';
import { SlotStepHeading, SlotDatePicker, SlotReservingIndicator, SlotGrid } from '@/components/booking';

export const SlotStep = () => {
  const [params] = useSearchParams();

  if (!params.get('doctorId')) return <Navigate to={ROUTES.book.specialty} replace />;
  return (
    <div>
      <SlotStepHeading />
      <SlotDatePicker />
      <SlotReservingIndicator />
      <SlotGrid />
    </div>
  );
};
