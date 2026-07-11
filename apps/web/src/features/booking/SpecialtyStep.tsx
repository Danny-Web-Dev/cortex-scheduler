import { useNavigate } from 'react-router-dom';
import type { Specialty } from '@cortex/shared';
import { PageHeading } from '@/components/ui';
import { SpecialtiesGrid } from '@/features/catalog';

export const SpecialtyStep = () => {
  const navigate = useNavigate();
  const onSelect = (specialty: Specialty) =>
    navigate(`/book/doctor?specialtyId=${specialty.id}`);

  return (
    <div>
      <PageHeading title="Choose a specialty" subtitle="What kind of care do you need?" />
      <SpecialtiesGrid onSelect={onSelect} />
    </div>
  );
};
