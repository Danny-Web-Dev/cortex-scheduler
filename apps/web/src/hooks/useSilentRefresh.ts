import { useEffect, useState } from 'react';
import { useRefreshSessionMutation } from '@/api/queries/auth';
import { authStore } from '@/state/auth';

export const useSilentRefresh = () => {
  const [ready, setReady] = useState(false);
  const refreshSession = useRefreshSessionMutation();

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const tokens = await refreshSession.mutateAsync();
        if (active) authStore.setSession(tokens.accessToken, tokens.user);
      } finally {
        if (active) setReady(true);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, []);

  return { ready };
};
