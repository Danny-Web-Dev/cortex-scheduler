import { useNavigate } from 'react-router-dom';
import type { Appointment, AppointmentStatusValue } from '@cortex/shared';
import { Button, Card } from '@/components/ui';
import { formatFullDateTime } from '@/lib';
import { useAppointmentActions } from './useAppointmentActions';

const STATUS_BADGE: Record<AppointmentStatusValue, string> = {
  HELD: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-brand-100 text-brand-700',
  CANCELLED: 'bg-ink-100 text-ink-500',
  COMPLETED: 'bg-ink-100 text-ink-600',
};

type AppointmentCardProps = {
  appointment: Appointment;
  actionable?: boolean;
};

export const AppointmentCard = ({ appointment, actionable = false }: AppointmentCardProps) => {
  const navigate = useNavigate();
  const { cancel } = useAppointmentActions();

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-ink-900">{appointment.doctorName}</p>
          <p className="text-sm text-ink-500">{appointment.specialtyName}</p>
          <p className="mt-2 text-sm font-medium text-ink-700">
            {formatFullDateTime(appointment.startsAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[appointment.status]}`}
        >
          {appointment.status}
        </span>
      </div>

      {actionable && (
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/book/slot?rescheduleId=${appointment.id}&doctorId=${appointment.doctorId}&specialtyId=${appointment.specialtyId}`)}
          >
            Reschedule
          </Button>
          <Button
            variant="danger"
            loading={cancel.isPending}
            onClick={() => cancel.mutate(appointment.id)}
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
};
