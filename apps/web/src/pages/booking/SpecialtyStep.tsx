import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { PageHeading } from '@/components/ui';
import { SpecialtiesGrid } from '@/components/catalog';
import { useBookingNavigation } from '@/hooks/booking';

export const SpecialtyStep = () => {
  const { t } = useTranslation();
  const { goToDoctors } = useBookingNavigation();
  const onSelect = (specialty: Specialty) => goToDoctors(specialty.id);

  return (
    <div>
      <PageHeading
        title={t('booking.specialty.title')}
        subtitle={t('booking.specialty.subtitle')}
      />
      <SpecialtiesGrid onSelect={onSelect} />
    </div>
  );
};
