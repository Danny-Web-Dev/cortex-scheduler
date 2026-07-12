import { useTranslation } from 'react-i18next';
import { SectionHeading, Skeleton } from '@/components/ui';
import { AppointmentList } from '@/components/appointments';
import { useMyAppointments } from '@/hooks/appointments';

export const UpcomingAppointmentsSection = () => {
  const { t } = useTranslation();
  const upcoming = useMyAppointments('upcoming');
  const hasUpcoming = (upcoming.data?.length ?? 0) > 0;

  if (upcoming.isPending) return <Skeleton className="h-28" />;
  if (!hasUpcoming) return null;
  return (
    <section>
      <SectionHeading>{t('dashboard.upcoming')}</SectionHeading>
      <AppointmentList scope="upcoming" emptyTitle={t('appointments.emptyUpcomingTitle')} />
    </section>
  );
};
