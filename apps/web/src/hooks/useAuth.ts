import { authStore } from '@/state/auth';
import { useStore } from './useStore';

export const useAuth = () => {
  const state = useStore(authStore);
  return {
    user: state.user,
    accessToken: state.accessToken,
    isAuthenticated: state.accessToken !== null,
    justRegistered: state.justRegistered,
  };
};
