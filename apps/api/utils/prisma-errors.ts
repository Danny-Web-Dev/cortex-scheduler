const UNIQUE_VIOLATION = 'P2002';

// Narrow an unknown thrown value to a Prisma known-request error by code,
// without importing Prisma's error class (keeps this dependency-light).
export const isUniqueConstraintViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === UNIQUE_VIOLATION;
