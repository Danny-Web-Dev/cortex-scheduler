import type { CookieOptions, Response } from 'express';
import { MS_PER_DAY, REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH, REFRESH_TOKEN_TTL_DAYS } from '@/config';

const baseCookieOptions = (isProduction: boolean): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  path: REFRESH_COOKIE_PATH,
});

export const setRefreshCookie = (res: Response, token: string, isProduction: boolean): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions(isProduction),
    maxAge: REFRESH_TOKEN_TTL_DAYS * MS_PER_DAY,
  });
};

export const clearRefreshCookie = (res: Response, isProduction: boolean): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions(isProduction));
};
