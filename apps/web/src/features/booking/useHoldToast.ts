import { useLocation } from 'react-router-dom';
import { useActiveHold, useHoldCountdown } from '@/hooks';

const CONFIRM_STEP_PATH = '/book/confirm';
// A past date so the countdown reads "expired" when there is no hold at all.
const NO_HOLD_EXPIRY = '1970-01-01T00:00:00.000Z';

// Drives the floating hold toast: visible whenever a live hold exists and the
// user is anywhere but the confirm step (which shows its own countdown).
export const useHoldToast = () => {
  const { activeHold } = useActiveHold();
  const { pathname } = useLocation();
  const { label, isExpired } = useHoldCountdown(activeHold?.holdExpiresAt ?? NO_HOLD_EXPIRY);

  const onConfirmStep = pathname.startsWith(CONFIRM_STEP_PATH);
  return { visible: activeHold !== null && !isExpired && !onConfirmStep, label };
};
