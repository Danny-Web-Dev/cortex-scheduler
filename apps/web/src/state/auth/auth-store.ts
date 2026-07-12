import type { AuthUser } from '@cortex/shared';
import { createStore } from '../createStore';

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
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
