import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui';

export const ConfirmHeading = () => {
  const { t } = useTranslation();

  return (
    <PageHeading title={t('booking.confirm.title')} subtitle={t('booking.confirm.subtitle')} />
  );
};
