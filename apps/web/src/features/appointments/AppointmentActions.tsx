import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@cortex/shared';
import { Button } from '@/components/ui';
import { useAppointmentActions } from './useAppointmentActions';

type AppointmentActionsProps = {
  appointment: Appointment;
};

export const AppointmentActions = ({ appointment }: AppointmentActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cancel } = useAppointmentActions();

  return (
    <div className="mt-4 flex gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          navigate(
            `/book/slot?rescheduleId=${appointment.id}&doctorId=${appointment.doctorId}&specialtyId=${appointment.specialtyId}`,
          )
        }
      >
        {t('appointments.reschedule')}
      </Button>
      <Button
        variant="danger"
        loading={cancel.isPending}
        onClick={() => cancel.mutate(appointment.id)}
      >
        {t('appointments.cancel')}
      </Button>
    </div>
  );
};
