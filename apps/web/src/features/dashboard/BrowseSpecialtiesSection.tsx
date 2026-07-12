import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { SectionHeading } from '@/components/ui';
import { SpecialtiesGrid } from '@/features/catalog';

export const BrowseSpecialtiesSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToDoctors = (specialty: Specialty) =>
    navigate(`/book/doctor?specialtyId=${specialty.id}`);

  return (
    <section>
      <SectionHeading>{t('dashboard.browseSpecialties')}</SectionHeading>
      <SpecialtiesGrid onSelect={goToDoctors} />
    </section>
  );
};
