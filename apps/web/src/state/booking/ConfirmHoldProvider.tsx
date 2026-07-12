import type { ReactNode } from 'react';
import type { Appointment } from '@cortex/shared';
import { useHoldCountdown } from '@/hooks';
import { useConfirmHold } from '@/hooks/booking';
import { createRequiredContext } from '../createRequiredContext';

type ConfirmHoldContextValue = {
  held: Appointment;
  label: string;
  isExpired: boolean;
  confirm: () => void;
  confirming: boolean;
  goBack: () => void;
  releasing: boolean;
};

const [ConfirmHoldContext, useConfirmHoldContext] =
  createRequiredContext<ConfirmHoldContextValue>('useConfirmHoldContext');

export { useConfirmHoldContext };

type ConfirmHoldProviderProps = {
  held: Appointment;
  children: ReactNode;
};

// Single owner of the countdown interval and the confirm/release mutations;
// the confirm-step units read them through context instead of props.
export const ConfirmHoldProvider = ({ held, children }: ConfirmHoldProviderProps) => {
  const { label, isExpired } = useHoldCountdown(held.holdExpiresAt ?? new Date().toISOString());
  const { confirm, confirming, goBack, releasing } = useConfirmHold(held);

  return (
    <ConfirmHoldContext.Provider
      value={{ held, label, isExpired, confirm, confirming, goBack, releasing }}
    >
      {children}
    </ConfirmHoldContext.Provider>
  );
};
