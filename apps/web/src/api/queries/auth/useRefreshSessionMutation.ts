import { useMutation } from '@tanstack/react-query';
import { client } from '@/api';

export const useRefreshSessionMutation = () =>
  useMutation({ mutationFn: () => client.auth.refresh() });
