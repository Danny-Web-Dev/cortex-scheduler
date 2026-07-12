import { useMutation } from '@tanstack/react-query';
import { client } from '@/api';

export const useReleaseHoldMutation = () =>
  useMutation({ mutationFn: (id: string) => client.appointments.releaseHold(id) });
