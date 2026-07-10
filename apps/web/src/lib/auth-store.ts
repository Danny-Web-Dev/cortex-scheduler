import type { AuthUser } from '@cortex/shared';

// Access token lives in memory only — never localStorage (XSS-safe). A tiny
// observable store so React can re-render on login/logout via useSyncExternalStore.
type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

let state: AuthState = { accessToken: null, user: null };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const authStore = {
  getState: (): AuthState => state,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setSession: (accessToken: string, user: AuthUser): void => {
    state = { accessToken, user };
    emit();
  },
  setAccessToken: (accessToken: string): void => {
    state = { ...state, accessToken };
    emit();
  },
  clear: (): void => {
    state = { accessToken: null, user: null };
    emit();
  },
};
