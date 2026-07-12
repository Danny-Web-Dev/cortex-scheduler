import { useTranslation } from 'react-i18next';
import type { AppointmentStatusValue } from '@cortex/shared';
import { Badge, type BadgeProps } from '@/components/ui';

const STATUS_TONE: Record<AppointmentStatusValue, BadgeProps['tone']> = {
  HELD: 'amber',
  CONFIRMED: 'brand',
  CANCELLED: 'neutral',
  COMPLETED: 'neutral-strong',
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatusValue;
};

export const AppointmentStatusBadge = ({ status }: AppointmentStatusBadgeProps) => {
  const { t } = useTranslation();

  return <Badge tone={STATUS_TONE[status]}>{t(`appointments.status.${status}`)}</Badge>;
};
