import { useMutation } from '@tanstack/react-query';
import type { RequestOtpInput } from '@cortex/shared';
import { client } from '@/api';

export const useRequestOtpMutation = () =>
  useMutation({ mutationFn: (input: RequestOtpInput) => client.auth.requestOtp(input) });
