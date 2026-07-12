import { useMutation } from '@tanstack/react-query';
import { client } from '@/api';

export const useLogoutMutation = () =>
  useMutation({ mutationFn: () => client.auth.logout() });
