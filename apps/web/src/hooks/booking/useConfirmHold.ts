import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@cortex/shared';
import { client, ApiError } from '@/api';
import { queryKeys, ROUTES } from '@/config';
import { holdStore } from '@/state/hold';
import { useToast } from '@/state/toast';

// Confirm / release actions for a held appointment. A 410 means the hold expired
// mid-request — send the user back to the slot grid to pick again. We navigate
// away from /book/confirm before clearing the hold store, so ConfirmStep's
// "no hold" guard can't race the redirect.
export const useConfirmHold = (held: Appointment) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const backToSlots = () => {
    void queryClient.invalidateQueries({ queryKey: ['doctors', held.doctorId, 'slots'] });
    navigate(ROUTES.book.slotWithDoctor({ specialtyId: held.specialtyId, doctorId: held.doctorId }));
    holdStore.clear();
  };

  const confirm = useMutation({
    mutationFn: () => client.appointments.confirm(held.id),
    onSuccess: () => {
      notify(t('booking.confirm.confirmedToast'), 'success');
      void queryClient.invalidateQueries({ queryKey: queryKeys.myAppointments('upcoming') });
      navigate(ROUTES.appointments);
      holdStore.clear();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'HOLD_EXPIRED') {
        notify(t('booking.confirm.holdExpiredToast'), 'error');
        backToSlots();
        return;
      }
      notify(
        error instanceof ApiError ? error.message : t('booking.confirm.confirmFailedToast'),
        'error',
      );
    },
  });

  const release = useMutation({
    mutationFn: () => client.appointments.releaseHold(held.id),
    onSettled: backToSlots,
  });

  return {
    confirm: () => confirm.mutate(),
    confirming: confirm.isPending,
    goBack: () => release.mutate(),
    releasing: release.isPending,
  };
};
