import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { OTP_CODE_LENGTH, REFRESH_TOKEN_BYTES } from './auth.constants';

const DECIMAL = 10;

export const generateOtpCode = (): string => {
  const max = DECIMAL ** OTP_CODE_LENGTH;
  return randomInt(0, max).toString().padStart(OTP_CODE_LENGTH, '0');
};

export const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

export const generateRefreshToken = (): string =>
  randomBytes(REFRESH_TOKEN_BYTES).toString('hex');

// Constant-time compare of two hex-encoded hashes of equal length.
export const safeHashEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};
