import { useSyncExternalStore } from 'react';
import { authStore } from '@/lib';

export const useAuth = () => {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
  return {
    user: state.user,
    accessToken: state.accessToken,
    isAuthenticated: state.accessToken !== null,
  };
};
