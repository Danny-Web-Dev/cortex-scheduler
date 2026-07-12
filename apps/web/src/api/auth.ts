import {
  AuthTokensSchema,
  RequestOtpResponseSchema,
  VerifyOtpResponseSchema,
  type AuthTokens,
  type RequestOtpInput,
  type RequestOtpResponse,
  type VerifyOtpInput,
  type VerifyOtpResponse,
} from '@cortex/shared';
import { apiFetch } from './http';
import { ENDPOINTS } from './endpoints';

export const auth = {
  requestOtp: async (input: RequestOtpInput): Promise<RequestOtpResponse> => {
    const data = await apiFetch<unknown>(ENDPOINTS.auth.otpRequest, {
      method: 'POST',
      body: input,
      auth: false,
    });
    return RequestOtpResponseSchema.parse(data);
  },

  verifyOtp: async (input: VerifyOtpInput): Promise<VerifyOtpResponse> => {
    const data = await apiFetch<unknown>(ENDPOINTS.auth.otpVerify, {
      method: 'POST',
      body: input,
      auth: false,
    });
    return VerifyOtpResponseSchema.parse(data);
  },

  refresh: async (): Promise<AuthTokens> => {
    const data = await apiFetch<unknown>(ENDPOINTS.auth.refresh, { method: 'POST', auth: false });
    return AuthTokensSchema.parse(data);
  },

  logout: async (): Promise<void> => {
    await apiFetch<void>(ENDPOINTS.auth.logout, { method: 'POST', auth: false });
  },
};
