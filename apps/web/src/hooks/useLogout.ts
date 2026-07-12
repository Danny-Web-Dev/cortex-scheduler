import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { client } from '@/api';
import { authStore } from '@/state/auth';
import { holdStore } from '@/state/hold';
import { ROUTES } from '@/config';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await client.auth.logout();
    } catch {
      // Best-effort — clear locally regardless of the server response.
    }
    authStore.clear();
    holdStore.clear();
    queryClient.clear();
    navigate(ROUTES.login, { replace: true });
  };
};
