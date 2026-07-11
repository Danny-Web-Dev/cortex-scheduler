export type ErrorCode =
  | 'SLOT_TAKEN'
  | 'HOLD_EXPIRED'
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_ATTEMPTS_EXCEEDED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export type ApiErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
