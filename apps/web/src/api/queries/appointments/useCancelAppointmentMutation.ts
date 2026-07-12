import { useMutation } from '@tanstack/react-query';
import { client } from '@/api';

export const useCancelAppointmentMutation = () =>
  useMutation({ mutationFn: (id: string) => client.appointments.cancel(id) });
