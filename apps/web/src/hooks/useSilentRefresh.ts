import { useEffect, useState } from 'react';
import { useRefreshSessionMutation } from '@/api/queries/auth';
import { authStore } from '@/state/auth';

// On app load, attempt one refresh to restore a session from the httpOnly
// cookie. `ready` gates the app so an authenticated hard-refresh doesn't flash
// the login screen before the token comes back.
export const useSilentRefresh = () => {
  const [ready, setReady] = useState(false);
  const refreshSession = useRefreshSessionMutation();

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const tokens = await refreshSession.mutateAsync();
        if (active) authStore.setSession(tokens.accessToken, tokens.user);
      } catch {
        // No valid session — stay logged out.
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
