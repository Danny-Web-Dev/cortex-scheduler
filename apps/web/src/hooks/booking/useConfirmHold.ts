import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@cortex/shared';
import { ApiError } from '@/api';
import { useConfirmAppointmentMutation, useReleaseHoldMutation } from '@/api/queries/appointments';
import { queryKeys, ROUTES } from '@/config';
import { holdStore } from '@/state/hold';
import { useToast } from '@/state/toast';
import { resolveErrorMessage } from '@/utils';
import { useHoldCountdown } from '@/hooks';

export const useConfirmHold = (held: Appointment) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const confirm = useConfirmAppointmentMutation();
  const release = useReleaseHoldMutation();
  const { label, isExpired } = useHoldCountdown(held.holdExpiresAt ?? new Date().toISOString());

  const backToSlots = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.slotsByDoctor(held.doctorId) });
    navigate(ROUTES.book.slotWithDoctor({ specialtyId: held.specialtyId, doctorId: held.doctorId }));
    holdStore.clear();
  };

  return {
    held,
    label,
    isExpired,
    confirm: () =>
      confirm.mutate(held.id, {
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
          notify(resolveErrorMessage(error, t, t('booking.confirm.confirmFailedToast')), 'error');
        },
      }),
    confirming: confirm.isPending,
    goBack: () => release.mutate(held.id, { onSettled: backToSlots }),
    releasing: release.isPending,
  };
};
