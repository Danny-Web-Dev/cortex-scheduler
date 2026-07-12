import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import type { Appointment } from '@cortex/shared';
import { Button, Callout, Card, PageHeading } from '@/components/ui';
import { formatFullDateTime } from '@/lib';
import { useActiveHold, useHoldCountdown } from '@/hooks';
import { useConfirmHold } from './useConfirmHold';

export const ConfirmStep = () => {
  const { activeHold } = useActiveHold();
  // Capture the hold on mount: clearing the store after confirm/release
  // re-renders synchronously while the router navigation is still a pending
  // transition, and a live read would bounce the user to /book/specialty
  // before the real redirect commits.
  const [held] = useState(activeHold);

  // Arrived without a hold (never started the flow) — restart.
  if (!held) return <Navigate to="/book/specialty" replace />;

  return <ConfirmView held={held} />;
};

const ConfirmView = ({ held }: { held: Appointment }) => {
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
            <dd className="text-title">{held.doctorName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.specialty')}</dt>
            <dd className="text-title">{held.specialtyName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.when')}</dt>
            <dd className="text-title">{formatFullDateTime(held.startsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('booking.confirm.durationLabel')}</dt>
            <dd className="text-title">
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
          <Trans
            i18nKey="booking.confirm.hold"
            values={{ label }}
            components={{ countdown: <span className="font-mono font-bold" /> }}
          />
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
