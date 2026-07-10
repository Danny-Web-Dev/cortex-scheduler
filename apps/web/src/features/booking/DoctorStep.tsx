import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import type { Doctor } from '@cortex/shared';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useDoctors } from './useDoctors';
import { DoctorCard } from './DoctorCard';

export const DoctorStep = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const specialtyId = params.get('specialtyId') ?? '';
  const { data, isPending, isError, refetch } = useDoctors(specialtyId);

  if (!specialtyId) return <Navigate to="/book/specialty" replace />;

  const onSelect = (doctor: Doctor) =>
    navigate(`/book/slot?specialtyId=${specialtyId}&doctorId=${doctor.id}`);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Choose a doctor</h1>
      <p className="mb-6 text-sm text-ink-500">All available in this specialty.</p>

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}
      {isError && <ErrorState message="Could not load doctors." onRetry={() => refetch()} />}
      {data && data.length === 0 && <EmptyState title="No doctors in this specialty" />}
      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};
