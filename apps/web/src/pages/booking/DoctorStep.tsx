import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui';
import { ROUTES } from '@/config';
import { DoctorGrid } from '@/components/booking';

export const DoctorStep = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  if (!params.get('specialtyId')) return <Navigate to={ROUTES.book.specialty} replace />;
  return (
    <div>
      <PageHeading title={t('booking.doctor.title')} subtitle={t('booking.doctor.subtitle')} />
      <DoctorGrid />
    </div>
  );
};
