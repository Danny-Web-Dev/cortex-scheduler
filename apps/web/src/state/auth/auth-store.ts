import { createStore } from 'zustand/vanilla';
import type { AuthUser } from '@cortex/shared';

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  justRegistered: boolean;
};

const store = createStore<AuthState>()(() => ({
  accessToken: null,
  user: null,
  justRegistered: false,
}));

export const authStore = {
  getState: store.getState,
  getInitialState: store.getInitialState,
  subscribe: store.subscribe,
  setSession: (accessToken: string, user: AuthUser): void => store.setState({ accessToken, user }),
  setAccessToken: (accessToken: string): void => store.setState({ accessToken }),
  setUser: (user: AuthUser): void => store.setState({ user }),
  markJustRegistered: (): void => store.setState({ justRegistered: true }),
  clear: (): void => store.setState({ accessToken: null, user: null, justRegistered: false }),
};
