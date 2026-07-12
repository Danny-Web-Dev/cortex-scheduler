import type { TFunction } from 'i18next';
import { ApiError } from '@/api';

// Maps a thrown error to user-facing copy. A typed API error resolves by its
// `code` (never by parsing messages); anything else — network failures, parse
// errors — uses the caller's fallback string, then a generic default.
export const resolveErrorMessage = (error: unknown, t: TFunction, fallback?: string): string => {
  if (error instanceof ApiError) return t(`errors.${error.code}`);
  return fallback ?? t('ui.error.default');
};
