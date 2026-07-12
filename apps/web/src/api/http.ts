import type { ErrorCode } from '@cortex/shared';
import type { RequestOptions } from '@/types';
import { env } from '@/config';
import { authStore } from '@/state/auth';
import { ApiError } from './error';
import { ENDPOINTS } from './endpoints';

const UNAUTHORIZED = 401;

const buildError = async (response: Response): Promise<ApiError> => {
  const fallback: ErrorCode = 'INTERNAL';
  try {
    const body = (await response.json()) as { error?: { code?: ErrorCode; message?: string } };
    return new ApiError(
      body.error?.code ?? fallback,
      body.error?.message ?? 'Request failed',
      response.status,
    );
  } catch {
    return new ApiError(fallback, 'Request failed', response.status);
  }
};

const rawFetch = (path: string, options: RequestOptions, token: string | null): Promise<Response> => {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${env.VITE_API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
};

let refreshInFlight: Promise<boolean> | null = null;

const tryRefresh = async (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${env.VITE_API_URL}${ENDPOINTS.auth.refresh}`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!response.ok) return false;
        const body = (await response.json()) as { accessToken?: string };
        if (!body.accessToken) return false;
        authStore.setAccessToken(body.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
};

const parse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = authStore.getState().accessToken;
  let response = await rawFetch(path, options, token);

  if (response.status === UNAUTHORIZED && options.auth !== false && path !== ENDPOINTS.auth.refresh) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      authStore.clear();
      throw await buildError(response);
    }
    response = await rawFetch(path, options, authStore.getState().accessToken);
  }

  if (!response.ok) throw await buildError(response);
  return parse<T>(response);
};
