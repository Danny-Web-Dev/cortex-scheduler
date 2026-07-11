const UNIQUE_VIOLATION = 'P2002';

export const isUniqueConstraintViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === UNIQUE_VIOLATION;
