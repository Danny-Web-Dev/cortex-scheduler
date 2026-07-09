export const OTP_TTL_MIN = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_CODE_LENGTH = 6;

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const REFRESH_TOKEN_BYTES = 32;

export const REFRESH_COOKIE_NAME = 'cortex_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';

// Throttling for OTP endpoints: 5 requests per minute per IP.
export const OTP_THROTTLE_LIMIT = 5;
export const OTP_THROTTLE_TTL_MS = 60_000;
