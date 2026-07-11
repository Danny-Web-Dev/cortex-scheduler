import type { Appointment, AppointmentScope } from '@cortex/shared';
import { EmptyState, QueryState, SkeletonGrid } from '@/components/ui';
import { useMyAppointments } from './useMyAppointments';
import { AppointmentCard } from './AppointmentCard';

const LIST_GRID_CLASS = 'grid gap-3';

type AppointmentListProps = {
  scope: AppointmentScope;
  emptyTitle: string;
  emptyDescription?: string;
};

export const AppointmentList = ({ scope, emptyTitle, emptyDescription }: AppointmentListProps) => {
  const query = useMyAppointments(scope);

  return (
    <QueryState
      query={query}
      skeleton={<SkeletonGrid count={2} itemClassName="h-28" className={LIST_GRID_CLASS} />}
      errorMessage="Could not load appointments."
      isEmpty={(data: Appointment[]) => data.length === 0}
      empty={<EmptyState title={emptyTitle} description={emptyDescription} />}
    >
      {(data) => (
        <div className={LIST_GRID_CLASS}>
          {data.map((appointment) => (
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
