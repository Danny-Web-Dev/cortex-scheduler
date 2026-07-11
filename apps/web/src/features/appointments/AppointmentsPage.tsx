import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PageHeading, SectionHeading } from '@/components/ui';
import { AppointmentList } from './AppointmentList';

export const AppointmentsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeading title={t('appointments.title')} className="mb-0" />
        <Link to="/book/specialty">
          <Button>{t('appointments.bookNew')}</Button>
        </Link>
      </div>

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
