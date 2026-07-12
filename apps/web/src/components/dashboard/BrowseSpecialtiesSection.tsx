import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { SectionHeading } from '@/components/ui';
import { SpecialtiesGrid } from '@/components/catalog';
import { useBookingNavigation } from '@/hooks/booking';

export const BrowseSpecialtiesSection = () => {
  const { t } = useTranslation();
  const { goToDoctors } = useBookingNavigation();

  const onSelect = (specialty: Specialty) => goToDoctors(specialty.id);

  return (
    <section>
      <SectionHeading>{t('dashboard.browseSpecialties')}</SectionHeading>
      <SpecialtiesGrid onSelect={onSelect} />
    </section>
  );
};
