import { ROUTE_PARAMS } from '@/config';
import {
  SlotStepHeading,
  SlotDatePicker,
  SlotReservingIndicator,
  SlotGrid,
  RequireBookingParam,
} from '@/components/booking';

export const SlotStep = () => (
  <RequireBookingParam param={ROUTE_PARAMS.doctorId}>
    <div>
      <SlotStepHeading />
      <SlotDatePicker />
      <SlotReservingIndicator />
      <SlotGrid />
    </div>
  </RequireBookingParam>
);
