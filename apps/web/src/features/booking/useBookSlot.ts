import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ApiError,
  holdAppointment,
  holdStore,
  mutationKeys,
  queryKeys,
  rescheduleAppointment,
} from '@/lib';
import { useToast } from '@/components/ui';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const refreshSlots = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.slots(doctorId, date) });

  const onSlotConflict = (error: unknown) => {
    const taken =
      error instanceof ApiError && (error.code === 'SLOT_TAKEN' || error.code === 'VALIDATION');
    notify(taken ? t('booking.slot.takenToast') : t('booking.slot.reserveFailedToast'), 'error');
    void refreshSlots();
  };

  const hold = useMutation({
    mutationKey: mutationKeys.bookSlot,
    mutationFn: (startsAt: string) => holdAppointment({ doctorId, startsAt }),
    onSuccess: async (appointment) => {
      // Await the route commit before storing the hold. navigate() (data
      // router) resolves after the URL has actually moved, so this
      // guarantees window.location — which HoldToast reads directly — is
      // already /book/confirm by the time the store update fires.
      await navigate('/book/confirm');
      holdStore.setHold(appointment);
    },
    onError: onSlotConflict,
  });

  const reschedule = useMutation({
    mutationKey: mutationKeys.bookSlot,
    mutationFn: (startsAt: string) => rescheduleAppointment(rescheduleId ?? '', { startsAt }),
    onSuccess: () => {
      notify(t('booking.slot.rescheduledToast'), 'success');
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
