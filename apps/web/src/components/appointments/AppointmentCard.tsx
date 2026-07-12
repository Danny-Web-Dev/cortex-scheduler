import type { Appointment } from '@cortex/shared';
import { Card } from '@/components/ui';
import { formatFullDateTime } from '@/utils';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { AppointmentActions } from './AppointmentActions';

type AppointmentCardProps = {
  appointment: Appointment;
  actionable?: boolean;
};

export const AppointmentCard = ({ appointment, actionable = false }: AppointmentCardProps) => (
  <Card>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-title">{appointment.doctorName}</p>
        <p className="text-subtitle">{appointment.specialtyName}</p>
        <p className="mt-2 text-sm font-medium text-ink-700">
          {formatFullDateTime(appointment.startsAt)}
        </p>
      </div>
      <AppointmentStatusBadge status={appointment.status} />
    </div>

    {actionable && <AppointmentActions appointment={appointment} />}
  </Card>
);
