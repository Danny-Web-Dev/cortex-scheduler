import { useStore } from 'zustand';
import { authStore } from '@/state/auth';

export const useAuth = () => {
  const state = useStore(authStore);
  return {
    user: state.user,
    accessToken: state.accessToken,
    isAuthenticated: state.accessToken !== null,
    justRegistered: state.justRegistered,
  };
};
