import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ApiError, holdAppointment, queryKeys, rescheduleAppointment } from '@/lib';
import { useToast } from '@/components/ui';
import { useBookingContext } from './booking-context';

type UseBookSlotArgs = {
  doctorId: string;
  date: string;
  rescheduleId: string | null;
};

// Selecting a slot either holds it (normal booking → confirm step) or reschedules
// an existing appointment onto it (atomic on the server → straight to the list).
// A 409/validation means the slot was taken between load and click — toast and
// refresh the grid.
export const useBookSlot = ({ doctorId, date, rescheduleId }: UseBookSlotArgs) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { setHeldAppointment } = useBookingContext();

  const refreshSlots = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.slots(doctorId, date) });

  const onSlotConflict = (error: unknown) => {
    const taken = error instanceof ApiError && (error.code === 'SLOT_TAKEN' || error.code === 'VALIDATION');
    notify(taken ? 'That time was just taken — pick another.' : 'Could not reserve the slot.', 'error');
    void refreshSlots();
  };

  const hold = useMutation({
    mutationFn: (startsAt: string) => holdAppointment({ doctorId, startsAt }),
    onSuccess: (appointment) => {
      setHeldAppointment(appointment);
      navigate('/book/confirm');
    },
    onError: onSlotConflict,
  });

  const reschedule = useMutation({
    mutationFn: (startsAt: string) => rescheduleAppointment(rescheduleId ?? '', { startsAt }),
    onSuccess: () => {
      notify('Appointment rescheduled', 'success');
      void queryClient.invalidateQueries({ queryKey: ['me', 'appointments'] });
      navigate('/appointments');
    },
    onError: onSlotConflict,
  });

  const select = (startsAt: string) => {
    if (rescheduleId) return reschedule.mutate(startsAt);
    return hold.mutate(startsAt);
  };

  return { select, pending: hold.isPending || reschedule.isPending };
};
