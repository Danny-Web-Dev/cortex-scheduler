import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '@/api/queries/auth';
import { authStore } from '@/state/auth';
import { holdStore } from '@/state/hold';
import { ROUTES } from '@/config';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useLogoutMutation();

  return async () => {
    try {
      await logout.mutateAsync();
    } finally {
      authStore.clear();
      holdStore.clear();
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    }
  };
};
