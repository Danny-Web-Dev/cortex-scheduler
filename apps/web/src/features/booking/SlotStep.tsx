import { Navigate, useSearchParams } from 'react-router-dom';
import { SlotStepHeading } from './SlotStepHeading';
import { SlotDatePicker } from './SlotDatePicker';
import { SlotReservingIndicator } from './SlotReservingIndicator';
import { SlotGrid } from './SlotGrid';

export const SlotStep = () => {
  const [params] = useSearchParams();

  if (!params.get('doctorId')) return <Navigate to="/book/specialty" replace />;
  return (
    <div>
      <SlotStepHeading />
      <SlotDatePicker />
      <SlotReservingIndicator />
      <SlotGrid />
    </div>
  );
};
