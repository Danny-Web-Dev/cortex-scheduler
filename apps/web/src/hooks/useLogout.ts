import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authStore, logout } from '@/lib';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await logout();
    } catch {
      // Best-effort — clear locally regardless of the server response.
    }
    authStore.clear();
    queryClient.clear();
    navigate('/login', { replace: true });
  };
};
