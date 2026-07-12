import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useActiveHold } from '@/hooks';
import { ConfirmHoldProvider } from './ConfirmHoldProvider';
import { ConfirmHeading } from './ConfirmHeading';
import { HoldSummary } from './HoldSummary';
import { HoldCountdownNotice } from './HoldCountdownNotice';
import { ConfirmActions } from './ConfirmActions';

export const ConfirmStep = () => {
  const { activeHold } = useActiveHold();
  // Capture the hold on mount: clearing the store after confirm/release
  // re-renders synchronously while the router navigation is still a pending
  // transition, and a live read would bounce the user to /book/specialty
  // before the real redirect commits.
  const [held] = useState(activeHold);

  // Arrived without a hold (never started the flow) — restart.
  if (!held) return <Navigate to="/book/specialty" replace />;

  return (
    <ConfirmHoldProvider held={held}>
      <div className="mx-auto max-w-lg">
        <ConfirmHeading />
        <HoldSummary />
        <HoldCountdownNotice />
        <ConfirmActions />
      </div>
    </ConfirmHoldProvider>
  );
};
