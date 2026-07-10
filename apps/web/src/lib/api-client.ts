import type { ErrorCode } from '@cortex/shared';
import { env } from './env';
import { authStore } from './auth-store';
import { ApiError } from './api-error';

const REFRESH_PATH = '/auth/refresh';
const UNAUTHORIZED = 401;

type RequestOptions = {
  method?: string;
  body?: unknown;
  // Public endpoints skip the Authorization header and the refresh dance.
  auth?: boolean;
};

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

// Single-flight refresh: concurrent 401s share one refresh call.
let refreshInFlight: Promise<boolean> | null = null;

const tryRefresh = async (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${env.VITE_API_URL}${REFRESH_PATH}`, {
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

// Core client: attaches the access token, and on a 401 tries a single refresh
// then retries once. A failed refresh clears the session so route guards bounce
// the user to /login.
export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = authStore.getState().accessToken;
  let response = await rawFetch(path, options, token);

  if (response.status === UNAUTHORIZED && options.auth !== false && path !== REFRESH_PATH) {
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
