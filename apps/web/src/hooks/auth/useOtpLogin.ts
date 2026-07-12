import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  RequestOtpSchema,
  UpdateProfileSchema,
  VerifyOtpSchema,
  normalizePhone,
} from '@cortex/shared';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@/api/queries/auth';
import { useUpdateProfileMutation } from '@/api/queries/users';
import { ROUTES } from '@/config';
import { authStore } from '@/state/auth';
import { resolveErrorMessage } from '@/utils';

type Step = 'phone' | 'code' | 'name';

// Drives the two-step phone → OTP login. Components below only render its state.
// A refreshed session that never finished registration resumes at the name step.
const initialStep = (): Step => {
  const { accessToken, user } = authStore.getState();
  if (accessToken && user && !user.name) return 'name';
  return 'phone';
};

export const useOtpLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(initialStep);
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

  const requestMutation = useRequestOtpMutation();
  const verifyMutation = useVerifyOtpMutation();
  const nameMutation = useUpdateProfileMutation();

  const submitPhone = (value: string) => {
    const parsed = RequestOtpSchema.safeParse({ phone: value });
    if (!parsed.success) return t('auth.error.invalidPhone');
    const normalized = normalizePhone(value);
    setPhone(normalized);
    requestMutation.mutate(
      { phone: normalized },
      {
        onSuccess: (res) => {
          setDevCode(res.devCode ?? null);
          setStep('code');
        },
      },
    );
    return null;
  };

  const submitCode = (value: string) => {
    const parsed = VerifyOtpSchema.safeParse({ phone, code: value });
    if (!parsed.success) return t('auth.error.invalidCode');
    verifyMutation.mutate(
      { phone, code: value },
      {
        onSuccess: (res) => {
          authStore.setSession(res.accessToken, res.user);
          if (res.isNewUser) {
            setStep('name');
            return;
          }
          navigate(ROUTES.dashboard, { replace: true });
        },
      },
    );
    return null;
  };

  const submitName = (value: string) => {
    const parsed = UpdateProfileSchema.safeParse({ name: value });
    if (!parsed.success) return t('auth.error.invalidName');
    nameMutation.mutate(parsed.data, {
      onSuccess: (user) => {
        authStore.markJustRegistered();
        authStore.setUser(user);
        navigate(ROUTES.dashboard, { replace: true });
      },
    });
    return null;
  };

  const resetToPhone = () => {
    setStep('phone');
    setDevCode(null);
    verifyMutation.reset();
  };

  const errorOf = (error: unknown): string | null =>
    error ? resolveErrorMessage(error, t, t('auth.error.requestFailed')) : null;

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
