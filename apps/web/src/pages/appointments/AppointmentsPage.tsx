import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui';
import { AppointmentsPageHeader, AppointmentList } from '@/components/appointments';

export const AppointmentsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <AppointmentsPageHeader />

      <section>
        <SectionHeading>{t('appointments.upcoming')}</SectionHeading>
        <AppointmentList
          scope="upcoming"
          emptyTitle={t('appointments.emptyUpcomingTitle')}
          emptyDescription={t('appointments.emptyUpcomingDescription')}
        />
      </section>

      <section>
        <SectionHeading>{t('appointments.past')}</SectionHeading>
        <AppointmentList scope="past" emptyTitle={t('appointments.emptyPastTitle')} />
      </section>
    </div>
  );
};
