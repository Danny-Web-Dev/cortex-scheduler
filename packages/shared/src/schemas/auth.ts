import { z } from 'zod';

// Israeli mobile numbers only (all OTP delivery is via Israeli SMS carriers):
// +972 5X XXXXXXX — 9 digits after the country code, starting with 5.
const ISRAEL_MOBILE_REGEX = /^\+9725\d{8}$/;
const OTP_CODE_LENGTH = 6;
const ISRAEL_COUNTRY_CODE = '972';

// Accepts common local Israeli formats (0545836388, 054-5836388, 00972545836388)
// alongside E.164, and normalizes all of them to canonical +972... form so the
// API always stores/compares a single representation.
export const normalizePhone = (raw: string): string => {
  const stripped = raw.trim().replace(/[\s-()]/g, '');
  if (stripped.startsWith('+')) return stripped;
  if (stripped.startsWith('00')) return `+${stripped.slice(2)}`;
  if (stripped.startsWith('0')) return `+${ISRAEL_COUNTRY_CODE}${stripped.slice(1)}`;
  if (stripped.startsWith(ISRAEL_COUNTRY_CODE)) return `+${stripped}`;
  return stripped;
};

const PhoneSchema = z.preprocess(
  (val) => (typeof val === 'string' ? normalizePhone(val) : val),
  z.string().regex(ISRAEL_MOBILE_REGEX, 'Enter a valid Israeli mobile number'),
);

export const RequestOtpSchema = z.object({
  phone: PhoneSchema,
});
export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  phone: PhoneSchema,
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

// Verify is the only auth response that knows whether the account was just created.
export const VerifyOtpResponseSchema = AuthTokensSchema.extend({
  isNewUser: z.boolean(),
});
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(NAME_MIN_LENGTH, 'Name is too short').max(NAME_MAX_LENGTH),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
