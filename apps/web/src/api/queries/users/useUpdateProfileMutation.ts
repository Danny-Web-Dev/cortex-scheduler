import { useMutation } from '@tanstack/react-query';
import type { UpdateProfileInput } from '@cortex/shared';
import { client } from '@/api';

export const useUpdateProfileMutation = () =>
  useMutation({ mutationFn: (input: UpdateProfileInput) => client.users.updateProfile(input) });
