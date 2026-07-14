import type { ReactNode } from 'react';
import type { Appointment } from '@cortex/shared';
import { useConfirmHold } from '@/hooks/booking';
import { createRequiredContext } from '../createRequiredContext';

type ConfirmHoldContextValue = ReturnType<typeof useConfirmHold>;

const [ConfirmHoldContext, useConfirmHoldContext] =
  createRequiredContext<ConfirmHoldContextValue>('useConfirmHoldContext');

export { useConfirmHoldContext };

type ConfirmHoldProviderProps = {
  held: Appointment;
  children: ReactNode;
};

export const ConfirmHoldProvider = ({ held, children }: ConfirmHoldProviderProps) => (
  <ConfirmHoldContext.Provider value={useConfirmHold(held)}>{children}</ConfirmHoldContext.Provider>
);
