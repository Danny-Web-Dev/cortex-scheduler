import type { AppointmentScope } from '@cortex/shared';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useMyAppointments } from './useMyAppointments';
import { AppointmentCard } from './AppointmentCard';

type AppointmentListProps = {
  scope: AppointmentScope;
  emptyTitle: string;
  emptyDescription?: string;
};

export const AppointmentList = ({ scope, emptyTitle, emptyDescription }: AppointmentListProps) => {
  const { data, isPending, isError, refetch } = useMyAppointments(scope);

  if (isPending) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (isError) return <ErrorState message="Could not load appointments." onRetry={() => refetch()} />;

  if (data.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="grid gap-3">
      {data.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          actionable={scope === 'upcoming'}
        />
      ))}
    </div>
  );
};
