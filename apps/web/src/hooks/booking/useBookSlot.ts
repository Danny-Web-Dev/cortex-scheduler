import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api';
import { useHoldAppointmentMutation, useRescheduleAppointmentMutation } from '@/api/queries/appointments';
import { queryKeys, ROUTES } from '@/config';
import { holdStore } from '@/state/hold';
import { useToast } from '@/state/toast';

type UseBookSlotArgs = {
  doctorId: string;
  date: string;
  rescheduleId: string | null;
};

export const useBookSlot = ({ doctorId, date, rescheduleId }: UseBookSlotArgs) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const hold = useHoldAppointmentMutation();
  const reschedule = useRescheduleAppointmentMutation();

  const refreshSlots = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.slots(doctorId, date) });

  const onSlotConflict = (error: unknown) => {
    const taken =
      error instanceof ApiError && (error.code === 'SLOT_TAKEN' || error.code === 'VALIDATION');
    notify(taken ? t('booking.slot.takenToast') : t('booking.slot.reserveFailedToast'), 'error');
    void refreshSlots();
  };

  const select = (startsAt: string) => {
    if (rescheduleId) {
      return reschedule.mutate(
        { id: rescheduleId, input: { startsAt } },
        {
          onSuccess: () => {
            notify(t('booking.slot.rescheduledToast'), 'success');
            void queryClient.invalidateQueries({ queryKey: queryKeys.myAppointmentsAll() });
            navigate(ROUTES.appointments);
          },
          onError: onSlotConflict,
        },
      );
    }

    return hold.mutate(
      { doctorId, startsAt },
      {
        onSuccess: async (appointment) => {
          await navigate(ROUTES.book.confirm);
          holdStore.setHold(appointment);
        },
        onError: onSlotConflict,
      },
    );
  };

  return { select, pending: hold.isPending || reschedule.isPending };
};
