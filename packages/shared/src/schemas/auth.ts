import { z } from 'zod';

// E.164-ish: optional leading +, 7–15 digits.
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
const OTP_CODE_LENGTH = 6;

export const RequestOtpSchema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone number'),
});
export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone number'),
  code: z.string().length(OTP_CODE_LENGTH).regex(/^\d+$/, 'Code must be digits'),
});
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const RequestOtpResponseSchema = z.object({
  phone: z.string(),
  expiresAt: z.string().datetime(),
  // Present only in development.
  devCode: z.string().optional(),
});
export type RequestOtpResponse = z.infer<typeof RequestOtpResponseSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().nullable(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  user: AuthUserSchema,
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
