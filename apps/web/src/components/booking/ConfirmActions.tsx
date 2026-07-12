import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useConfirmHoldContext } from '@/state/booking';

export const ConfirmActions = () => {
  const { t } = useTranslation();
  const { confirm, confirming, goBack, releasing, isExpired } = useConfirmHoldContext();

  return (
    <div className="mt-6 flex gap-3">
      <Button variant="secondary" onClick={goBack} loading={releasing} className="flex-1">
        {t('booking.confirm.back')}
      </Button>
      <Button onClick={confirm} loading={confirming} disabled={isExpired} className="flex-1">
        {t('booking.confirm.submit')}
      </Button>
    </div>
  );
};
