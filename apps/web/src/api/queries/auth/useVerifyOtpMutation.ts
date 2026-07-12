import { useMutation } from '@tanstack/react-query';
import type { VerifyOtpInput } from '@cortex/shared';
import { client } from '@/api';

export const useVerifyOtpMutation = () =>
  useMutation({ mutationFn: (input: VerifyOtpInput) => client.auth.verifyOtp(input) });
