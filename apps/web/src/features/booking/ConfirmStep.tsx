import { Navigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
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

const ConfirmView = ({
  held,
}: {
  held: NonNullable<ReturnType<typeof useBookingContext>['heldAppointment']>;
}) => {
  const { t } = useTranslation();
  const { label, isExpired } = useHoldCountdown(held.holdExpiresAt ?? new Date().toISOString());
  const { confirm, confirming, goBack, releasing } = useConfirmHold(held);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeading title={t('booking.confirm.title')} subtitle={t('booking.confirm.subtitle')} />

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.doctor')}</dt>
            <dd className="font-medium text-ink-900">{held.doctorName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.specialty')}</dt>
            <dd className="font-medium text-ink-900">{held.specialtyName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.when')}</dt>
            <dd className="font-medium text-ink-900">{formatFullDateTime(held.startsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.durationLabel')}</dt>
            <dd className="font-medium text-ink-900">
              {t('booking.confirm.duration', { durationMin: held.durationMin })}
            </dd>
          </div>
        </dl>
      </Card>

      {isExpired ? (
        <Callout tone="amber" className="mt-5">
          {t('booking.confirm.expired')}
        </Callout>
      ) : (
        <Callout tone="brand" className="mt-5">
          <Trans i18nKey="booking.confirm.hold" values={{ label }}>
            Slot held for <span className="font-mono font-bold" />
          </Trans>
        </Callout>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={goBack} loading={releasing} className="flex-1">
          {t('booking.confirm.back')}
        </Button>
        <Button onClick={confirm} loading={confirming} disabled={isExpired} className="flex-1">
          {t('booking.confirm.submit')}
        </Button>
      </div>
    </div>
  );
};
