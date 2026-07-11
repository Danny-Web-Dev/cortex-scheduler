import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Doctor } from '@cortex/shared';
import { EmptyState, PageHeading, QueryState, SkeletonGrid } from '@/components/ui';
import { useDoctors } from './useDoctors';
import { DoctorCard } from './DoctorCard';

const DOCTORS_GRID_CLASS = 'grid gap-4 sm:grid-cols-2';

export const DoctorStep = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const specialtyId = params.get('specialtyId') ?? '';
  const query = useDoctors(specialtyId);

  if (!specialtyId) return <Navigate to="/book/specialty" replace />;

  const onSelect = (doctor: Doctor) =>
    navigate(`/book/slot?specialtyId=${specialtyId}&doctorId=${doctor.id}`);

  return (
    <div>
      <PageHeading title={t('booking.doctor.title')} subtitle={t('booking.doctor.subtitle')} />

      <QueryState
        query={query}
        skeleton={<SkeletonGrid count={4} itemClassName="h-32" className={DOCTORS_GRID_CLASS} />}
        errorMessage={t('booking.doctor.error')}
        isEmpty={(data: Doctor[]) => data.length === 0}
        empty={<EmptyState title={t('booking.doctor.empty')} />}
      >
        {(data) => (
          <div className={DOCTORS_GRID_CLASS}>
            {data.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onSelect={onSelect} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
};
