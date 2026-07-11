import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { PageHeading } from '@/components/ui';
import { SpecialtiesGrid } from '@/features/catalog';

export const SpecialtyStep = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onSelect = (specialty: Specialty) => navigate(`/book/doctor?specialtyId=${specialty.id}`);

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
