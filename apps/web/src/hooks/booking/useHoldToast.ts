import { useLocation } from 'react-router-dom';
import { useActiveHold, useHoldCountdown } from '@/hooks';
import { ROUTES } from '@/config';

const NO_HOLD_EXPIRY = '1970-01-01T00:00:00.000Z';

export const useHoldToast = () => {
  const { activeHold } = useActiveHold();
  useLocation();
  const { label, isExpired } = useHoldCountdown(activeHold?.holdExpiresAt ?? NO_HOLD_EXPIRY);

  const onConfirmStep = window.location.pathname.startsWith(ROUTES.book.confirm);
  return { visible: activeHold !== null && !isExpired && !onConfirmStep, label };
};
