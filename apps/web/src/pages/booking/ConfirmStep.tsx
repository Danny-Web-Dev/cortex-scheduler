import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config';
import { useActiveHold } from '@/hooks';
import { ConfirmHoldProvider } from '@/state/booking';
import { ConfirmHeading, HoldSummary, HoldCountdownNotice, ConfirmActions } from '@/components/booking';

export const ConfirmStep = () => {
  const { activeHold } = useActiveHold();
  const [held] = useState(activeHold);

  if (!held) return <Navigate to={ROUTES.book.specialty} replace />;

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
