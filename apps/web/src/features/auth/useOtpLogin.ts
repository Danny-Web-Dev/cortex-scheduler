import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RequestOtpSchema, UpdateProfileSchema, VerifyOtpSchema, normalizePhone } from '@cortex/shared';
import { ApiError, authStore, requestOtp, updateProfile, verifyOtp } from '@/lib';

type Step = 'phone' | 'code' | 'name';

// Drives the two-step phone → OTP login. Components below only render its state.
// A refreshed session that never finished registration resumes at the name step.
const initialStep = (): Step => {
  const { accessToken, user } = authStore.getState();
  if (accessToken && user && !user.name) return 'name';
  return 'phone';
};

export const useOtpLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(initialStep);
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
    onSuccess: (res) => {
      authStore.setSession(res.accessToken, res.user);
      if (res.isNewUser) {
        setStep('name');
        return;
      }
      navigate('/dashboard', { replace: true });
    },
  });

  const nameMutation = useMutation({
    mutationFn: (name: string) => updateProfile({ name }),
    onSuccess: (user) => {
      authStore.markJustRegistered();
      authStore.setUser(user);
      navigate('/dashboard', { replace: true });
    },
  });

  const submitPhone = (value: string) => {
    const parsed = RequestOtpSchema.safeParse({ phone: value });
    if (!parsed.success) return 'Enter a valid phone number (e.g. 054-1234567)';
    const normalized = normalizePhone(value);
    setPhone(normalized);
    requestMutation.mutate(normalized);
    return null;
  };

  const submitCode = (value: string) => {
    const parsed = VerifyOtpSchema.safeParse({ phone, code: value });
    if (!parsed.success) return 'Enter the 6-digit code';
    verifyMutation.mutate(value);
    return null;
  };

  const submitName = (value: string) => {
    const parsed = UpdateProfileSchema.safeParse({ name: value });
    if (!parsed.success) return 'Enter your full name';
    nameMutation.mutate(parsed.data.name);
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
    submitName,
    resetToPhone,
    requesting: requestMutation.isPending,
    verifying: verifyMutation.isPending,
    savingName: nameMutation.isPending,
    requestError: errorOf(requestMutation.error),
    verifyError: errorOf(verifyMutation.error),
    nameError: errorOf(nameMutation.error),
  };
};
