import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useCancelAppointmentMutation } from '@/api/queries/appointments';
import { queryKeys } from '@/config';
import { useToast } from '@/state/toast';
import { resolveErrorMessage } from '@/utils';

export const useAppointmentActions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const cancelMutation = useCancelAppointmentMutation();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.myAppointmentsAll() });

  const cancel = {
    ...cancelMutation,
    mutate: (id: string) =>
      cancelMutation.mutate(id, {
        onSuccess: () => {
          notify(t('appointments.cancelledToast'), 'success');
          void invalidate();
        },
        onError: (error) => {
          notify(resolveErrorMessage(error, t, t('appointments.cancelFailedToast')), 'error');
        },
      }),
  };

  return { cancel };
};
