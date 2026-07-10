import { createContext, useContext } from 'react';
import type { Appointment } from '@cortex/shared';

// Carries the freshly held appointment from the slot step to the confirm step.
// In memory only — a page refresh on /book/confirm sends the user back to pick
// a slot, which is the correct behavior for an expiring hold.
type BookingContextValue = {
  heldAppointment: Appointment | null;
  setHeldAppointment: (appointment: Appointment | null) => void;
};

export const BookingContext = createContext<BookingContextValue | null>(null);

export const useBookingContext = (): BookingContextValue => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingContext must be used within a BookingLayout');
  return ctx;
};
