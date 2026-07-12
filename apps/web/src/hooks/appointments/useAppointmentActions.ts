import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { client, ApiError } from '@/api';
import { useToast } from '@/state/toast';

export const useAppointmentActions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['me', 'appointments'] });

  const cancel = useMutation({
    mutationFn: (id: string) => client.appointments.cancel(id),
    onSuccess: () => {
      notify(t('appointments.cancelledToast'), 'success');
      void invalidate();
    },
    onError: (error) => {
      notify(
        error instanceof ApiError ? error.message : t('appointments.cancelFailedToast'),
        'error',
      );
    },
  });

  return { cancel };
};
