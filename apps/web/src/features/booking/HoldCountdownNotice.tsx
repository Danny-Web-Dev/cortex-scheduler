import { Trans, useTranslation } from 'react-i18next';
import { Callout } from '@/components/ui';
import { useConfirmHoldContext } from './ConfirmHoldProvider';

export const HoldCountdownNotice = () => {
  const { t } = useTranslation();
  const { label, isExpired } = useConfirmHoldContext();

  if (isExpired) {
    return (
      <Callout tone="amber" className="mt-5">
        {t('booking.confirm.expired')}
      </Callout>
    );
  }
  return (
    <Callout tone="brand" className="mt-5">
      <Trans
        i18nKey="booking.confirm.hold"
        values={{ label }}
        components={{ countdown: <span className="font-mono font-bold" /> }}
      />
    </Callout>
  );
};
