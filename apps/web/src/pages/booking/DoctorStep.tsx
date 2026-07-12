import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui';
import { ROUTE_PARAMS } from '@/config';
import { DoctorGrid, RequireBookingParam } from '@/components/booking';

export const DoctorStep = () => {
  const { t } = useTranslation();

  return (
    <RequireBookingParam param={ROUTE_PARAMS.specialtyId}>
      <div>
        <PageHeading title={t('booking.doctor.title')} subtitle={t('booking.doctor.subtitle')} />
        <DoctorGrid />
      </div>
    </RequireBookingParam>
  );
};
