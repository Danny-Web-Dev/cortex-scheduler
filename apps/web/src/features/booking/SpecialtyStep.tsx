import { useNavigate } from 'react-router-dom';
import type { Specialty } from '@cortex/shared';
import { SpecialtiesGrid } from '@/features/catalog';

export const SpecialtyStep = () => {
  const navigate = useNavigate();
  const onSelect = (specialty: Specialty) =>
    navigate(`/book/doctor?specialtyId=${specialty.id}`);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Choose a specialty</h1>
      <p className="mb-6 text-sm text-ink-500">What kind of care do you need?</p>
      <SpecialtiesGrid onSelect={onSelect} />
    </div>
  );
};
