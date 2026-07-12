import { useLocation } from 'react-router-dom';
import { useActiveHold, useHoldCountdown } from '@/hooks';
import { ROUTES } from '@/config';

// A past date so the countdown reads "expired" when there is no hold at all.
const NO_HOLD_EXPIRY = '1970-01-01T00:00:00.000Z';

// Drives the floating hold toast: visible whenever a live hold exists and the
// user is anywhere but the confirm step (which shows its own countdown).
export const useHoldToast = () => {
  const { activeHold } = useActiveHold();
  // Subscribe to route changes so we re-render on navigation, but compare
  // against window.location directly rather than this hook's pathname: on a
  // data router, the browser URL commits before RouterProvider's own context
  // catches up, and a hold set in that gap would otherwise read as "not on
  // confirm" for a frame and flash the toast on.
  useLocation();
  const { label, isExpired } = useHoldCountdown(activeHold?.holdExpiresAt ?? NO_HOLD_EXPIRY);

  const onConfirmStep = window.location.pathname.startsWith(ROUTES.book.confirm);
  return { visible: activeHold !== null && !isExpired && !onConfirmStep, label };
};
