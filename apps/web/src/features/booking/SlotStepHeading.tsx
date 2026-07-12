import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui';
import { localTimeZoneLabel } from '@/lib';

export const SlotStepHeading = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const rescheduleId = params.get('rescheduleId');

  return (
    <PageHeading
      title={rescheduleId ? t('booking.slot.titleReschedule') : t('booking.slot.title')}
      subtitle={t('booking.slot.subtitle', { tz: localTimeZoneLabel() })}
    />
  );
};
