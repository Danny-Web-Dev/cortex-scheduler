import type { AuthUser } from '@cortex/shared';
import { createStore } from '../createStore';

// Access token lives in memory only — never localStorage (XSS-safe). A tiny
// observable store so React can re-render on login/logout via useSyncExternalStore.
type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  // True only for the session in which the account was created — drives the
  // one-time "Welcome" (vs "Welcome back") greeting.
  justRegistered: boolean;
};

const store = createStore<AuthState>({ accessToken: null, user: null, justRegistered: false });

export const authStore = {
  getState: store.getState,
  subscribe: store.subscribe,
  setSession: (accessToken: string, user: AuthUser): void =>
    store.setState((s) => ({ ...s, accessToken, user })),
  setAccessToken: (accessToken: string): void =>
    store.setState((s) => ({ ...s, accessToken })),
  setUser: (user: AuthUser): void => store.setState((s) => ({ ...s, user })),
  markJustRegistered: (): void => store.setState((s) => ({ ...s, justRegistered: true })),
  clear: (): void =>
    store.setState(() => ({ accessToken: null, user: null, justRegistered: false })),
};
