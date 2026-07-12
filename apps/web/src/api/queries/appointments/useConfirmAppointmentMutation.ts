import { useMutation } from '@tanstack/react-query';
import { client } from '@/api';

export const useConfirmAppointmentMutation = () =>
  useMutation({ mutationFn: (id: string) => client.appointments.confirm(id) });
