import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PageHeading } from '@/components/ui';

export const AppointmentsPageHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <PageHeading title={t('appointments.title')} className="mb-0" />
      <Link to="/book/specialty">
        <Button>{t('appointments.bookNew')}</Button>
      </Link>
    </div>
  );
};
