import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RequestOtpSchema, VerifyOtpSchema } from '@cortex/shared';
import { ApiError, authStore, requestOtp, verifyOtp } from '@/lib';

type Step = 'phone' | 'code';

// Drives the two-step phone → OTP login. Components below only render its state.
export const useOtpLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

  const requestMutation = useMutation({
    mutationFn: (nextPhone: string) => requestOtp({ phone: nextPhone }),
    onSuccess: (res) => {
      setDevCode(res.devCode ?? null);
      setStep('code');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => verifyOtp({ phone, code }),
    onSuccess: (tokens) => {
      authStore.setSession(tokens.accessToken, tokens.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const submitPhone = (value: string) => {
    const parsed = RequestOtpSchema.safeParse({ phone: value });
    if (!parsed.success) return 'Enter a valid phone number (e.g. +972541234567)';
    setPhone(value);
    requestMutation.mutate(value);
    return null;
  };

  const submitCode = (value: string) => {
    const parsed = VerifyOtpSchema.safeParse({ phone, code: value });
    if (!parsed.success) return 'Enter the 6-digit code';
    verifyMutation.mutate(value);
    return null;
  };

  const resetToPhone = () => {
    setStep('phone');
    setDevCode(null);
    verifyMutation.reset();
  };

  const errorOf = (error: unknown): string | null =>
    error instanceof ApiError ? error.message : error ? 'Request failed' : null;

  return {
    step,
    phone,
    devCode,
    submitPhone,
    submitCode,
    resetToPhone,
    requesting: requestMutation.isPending,
    verifying: verifyMutation.isPending,
    requestError: errorOf(requestMutation.error),
    verifyError: errorOf(verifyMutation.error),
  };
};
