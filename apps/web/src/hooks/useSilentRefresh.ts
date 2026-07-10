import { useEffect, useState } from 'react';
import { authStore, refreshSession } from '@/lib';

// On app load, attempt one refresh to restore a session from the httpOnly
// cookie. `ready` gates the app so an authenticated hard-refresh doesn't flash
// the login screen before the token comes back.
export const useSilentRefresh = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const tokens = await refreshSession();
        if (active) authStore.setSession(tokens.accessToken, tokens.user);
      } catch {
        // No valid session — stay logged out.
      } finally {
        if (active) setReady(true);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  return { ready };
};
