import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui';
import { ROUTES } from '@/config';
import { AppointmentList } from '@/components/appointments';
import { useMyAppointments } from '@/hooks/appointments';

export const RecentVisitsSection = () => {
  const { t } = useTranslation();
  const past = useMyAppointments('past');
  const hasPast = (past.data?.length ?? 0) > 0;

  if (!hasPast) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <SectionHeading>{t('dashboard.recentVisits')}</SectionHeading>
        <Link
          to={ROUTES.appointments}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {t('dashboard.viewAllAppointments')}
        </Link>
      </div>
      <AppointmentList scope="past" limit={3} emptyTitle={t('appointments.emptyPastTitle')} />
    </section>
  );
};
