import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { EmptyState, QueryState, SkeletonGrid } from '@/components/ui';
import { useSpecialties } from './useSpecialties';
import { SpecialtyCard } from './SpecialtyCard';

const SPECIALTIES_GRID_CLASS = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

type SpecialtiesGridProps = {
  onSelect?: (specialty: Specialty) => void;
};

export const SpecialtiesGrid = ({ onSelect }: SpecialtiesGridProps) => {
  const { t } = useTranslation();
  const query = useSpecialties();

  return (
    <QueryState
      query={query}
      skeleton={<SkeletonGrid count={6} itemClassName="h-32" className={SPECIALTIES_GRID_CLASS} />}
      errorMessage={t('catalog.error')}
      isEmpty={(data: Specialty[]) => data.length === 0}
      empty={<EmptyState title={t('catalog.empty')} />}
    >
      {(data) => (
        <div className={SPECIALTIES_GRID_CLASS}>
          {data.map((specialty) => (
            <SpecialtyCard key={specialty.id} specialty={specialty} onSelect={onSelect} />
          ))}
        </div>
      )}
    </QueryState>
  );
};
