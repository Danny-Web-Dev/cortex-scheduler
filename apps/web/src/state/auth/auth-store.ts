import type { AuthUser } from '@cortex/shared';

// Access token lives in memory only — never localStorage (XSS-safe). A tiny
// observable store so React can re-render on login/logout via useSyncExternalStore.
type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  // True only for the session in which the account was created — drives the
  // one-time "Welcome" (vs "Welcome back") greeting.
  justRegistered: boolean;
};

let state: AuthState = { accessToken: null, user: null, justRegistered: false };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const authStore = {
  getState: (): AuthState => state,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setSession: (accessToken: string, user: AuthUser): void => {
    state = { ...state, accessToken, user };
    emit();
  },
  setAccessToken: (accessToken: string): void => {
    state = { ...state, accessToken };
    emit();
  },
  setUser: (user: AuthUser): void => {
    state = { ...state, user };
    emit();
  },
  markJustRegistered: (): void => {
    state = { ...state, justRegistered: true };
    emit();
  },
  clear: (): void => {
    state = { accessToken: null, user: null, justRegistered: false };
    emit();
  },
};
