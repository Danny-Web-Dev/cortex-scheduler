import type { TFunction } from 'i18next';
import { ApiError } from '@/api';

export const resolveErrorMessage = (error: unknown, t: TFunction, fallback?: string): string => {
  if (error instanceof ApiError) return t(`errors.${error.code}`);
  return fallback ?? t('ui.error.default');
};
