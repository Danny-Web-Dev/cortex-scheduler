import {
  AuthTokensSchema,
  RequestOtpResponseSchema,
  type AuthTokens,
  type RequestOtpInput,
  type RequestOtpResponse,
  type VerifyOtpInput,
} from '@cortex/shared';
import { apiFetch } from '../api-client';

export const requestOtp = async (input: RequestOtpInput): Promise<RequestOtpResponse> => {
  const data = await apiFetch<unknown>('/auth/otp/request', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return RequestOtpResponseSchema.parse(data);
};

export const verifyOtp = async (input: VerifyOtpInput): Promise<AuthTokens> => {
  const data = await apiFetch<unknown>('/auth/otp/verify', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return AuthTokensSchema.parse(data);
};

export const refreshSession = async (): Promise<AuthTokens> => {
  const data = await apiFetch<unknown>('/auth/refresh', { method: 'POST', auth: false });
  return AuthTokensSchema.parse(data);
};

export const logout = async (): Promise<void> => {
  await apiFetch<void>('/auth/logout', { method: 'POST', auth: false });
};
