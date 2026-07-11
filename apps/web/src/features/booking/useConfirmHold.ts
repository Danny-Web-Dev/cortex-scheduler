import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@cortex/shared';
import { ApiError, confirmAppointment, queryKeys, releaseHold } from '@/lib';
import { useToast } from '@/components/ui';

// Confirm / release actions for a held appointment. A 410 means the hold expired
// mid-request — send the user back to the slot grid to pick again. We navigate
// away from /book/confirm rather than clearing the held appointment in place, so
// ConfirmStep's "no hold" guard can't race the success redirect.
export const useConfirmHold = (held: Appointment) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const backToSlots = () => {
    void queryClient.invalidateQueries({ queryKey: ['doctors', held.doctorId, 'slots'] });
    navigate(`/book/slot?specialtyId=${held.specialtyId}&doctorId=${held.doctorId}`);
  };

  const confirm = useMutation({
    mutationFn: () => confirmAppointment(held.id),
    onSuccess: () => {
      notify(t('booking.confirm.confirmedToast'), 'success');
      void queryClient.invalidateQueries({ queryKey: queryKeys.myAppointments('upcoming') });
      navigate('/appointments');
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
    mutationFn: () => releaseHold(held.id),
    onSettled: backToSlots,
  });

  return {
    confirm: () => confirm.mutate(),
    confirming: confirm.isPending,
    goBack: () => release.mutate(),
    releasing: release.isPending,
  };
};
