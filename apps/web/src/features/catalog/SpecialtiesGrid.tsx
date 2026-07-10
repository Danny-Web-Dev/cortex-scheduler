import type { Specialty } from '@cortex/shared';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useSpecialties } from './useSpecialties';
import { SpecialtyCard } from './SpecialtyCard';

type SpecialtiesGridProps = {
  onSelect?: (specialty: Specialty) => void;
};

export const SpecialtiesGrid = ({ onSelect }: SpecialtiesGridProps) => {
  const { data, isPending, isError, refetch } = useSpecialties();

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState message="Could not load specialties." onRetry={() => refetch()} />;

  if (data.length === 0) return <EmptyState title="No specialties available" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((specialty) => (
        <SpecialtyCard key={specialty.id} specialty={specialty} onSelect={onSelect} />
      ))}
    </div>
  );
};
