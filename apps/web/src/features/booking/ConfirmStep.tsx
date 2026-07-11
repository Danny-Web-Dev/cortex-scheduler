import { Navigate } from 'react-router-dom';
import { Button, Callout, Card, PageHeading } from '@/components/ui';
import { formatFullDateTime } from '@/lib';
import { useHoldCountdown } from '@/hooks';
import { useBookingContext } from './booking-context';
import { useConfirmHold } from './useConfirmHold';

export const ConfirmStep = () => {
  const { heldAppointment } = useBookingContext();

  // No hold in memory (e.g. a refresh landed here) — restart the flow.
  if (!heldAppointment) return <Navigate to="/book/specialty" replace />;

  return <ConfirmView held={heldAppointment} />;
};

const ConfirmView = ({ held }: { held: NonNullable<ReturnType<typeof useBookingContext>['heldAppointment']> }) => {
  const { label, isExpired } = useHoldCountdown(held.holdExpiresAt ?? new Date().toISOString());
  const { confirm, confirming, goBack, releasing } = useConfirmHold(held);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeading
        title="Confirm your appointment"
        subtitle="Review the details and confirm before the hold expires."
      />

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Doctor</dt>
            <dd className="font-medium text-ink-900">{held.doctorName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Specialty</dt>
            <dd className="font-medium text-ink-900">{held.specialtyName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">When</dt>
            <dd className="font-medium text-ink-900">{formatFullDateTime(held.startsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Duration</dt>
            <dd className="font-medium text-ink-900">{held.durationMin} min</dd>
          </div>
        </dl>
      </Card>

      {isExpired ? (
        <Callout tone="amber" className="mt-5">
          Your hold expired. Please pick a time again.
        </Callout>
      ) : (
        <Callout tone="brand" className="mt-5">
          Slot held for <span className="font-mono font-bold">{label}</span>
        </Callout>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={goBack} loading={releasing} className="flex-1">
          Back to times
        </Button>
        <Button
          onClick={confirm}
          loading={confirming}
          disabled={isExpired}
          className="flex-1"
        >
          Confirm appointment
        </Button>
      </div>
    </div>
  );
};
