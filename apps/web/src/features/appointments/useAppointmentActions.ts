import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, cancelAppointment } from '@/lib';
import { useToast } from '@/components/ui';

export const useAppointmentActions = () => {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['me', 'appointments'] });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      notify('Appointment cancelled', 'success');
      void invalidate();
    },
    onError: (error) => {
      notify(error instanceof ApiError ? error.message : 'Could not cancel', 'error');
    },
  });

  return { cancel };
};
