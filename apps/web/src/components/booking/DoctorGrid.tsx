import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Doctor } from '@cortex/shared';
import { EmptyState, QueryState, SkeletonGrid } from '@/components/ui';
import { ROUTES } from '@/config';
import { useDoctors } from '@/hooks/booking';
import { DoctorCard } from './DoctorCard';

const DOCTORS_GRID_CLASS = 'grid gap-4 sm:grid-cols-2';

export const DoctorGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const specialtyId = params.get('specialtyId') ?? '';
  const query = useDoctors(specialtyId);

  const onSelect = (doctor: Doctor) =>
    navigate(ROUTES.book.slotWithDoctor({ specialtyId, doctorId: doctor.id }));

  return (
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
  );
};
