import { useTranslation } from 'react-i18next';
import type { Appointment, AppointmentScope } from '@cortex/shared';
import { EmptyState, QueryState, SkeletonGrid } from '@/components/ui';
import { useMyAppointments } from './useMyAppointments';
import { AppointmentCard } from './AppointmentCard';

const LIST_GRID_CLASS = 'grid gap-3';

type AppointmentListProps = {
  scope: AppointmentScope;
  emptyTitle: string;
  emptyDescription?: string;
  limit?: number;
};

export const AppointmentList = ({
  scope,
  emptyTitle,
  emptyDescription,
  limit,
}: AppointmentListProps) => {
  const { t } = useTranslation();
  const query = useMyAppointments(scope);

  return (
    <QueryState
      query={query}
      skeleton={<SkeletonGrid count={2} itemClassName="h-28" className={LIST_GRID_CLASS} />}
      errorMessage={t('appointments.error')}
      isEmpty={(data: Appointment[]) => data.length === 0}
      empty={<EmptyState title={emptyTitle} description={emptyDescription} />}
    >
      {(data) => (
        <div className={LIST_GRID_CLASS}>
          {(limit ? data.slice(0, limit) : data).map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              actionable={scope === 'upcoming'}
            />
          ))}
        </div>
      )}
    </QueryState>
  );
};
