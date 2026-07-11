import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { Button, SectionHeading, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks';
import { SpecialtiesGrid } from '@/features/catalog';
import { SearchBar } from '@/features/search';
import { AppointmentList, useMyAppointments } from '@/features/appointments';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, justRegistered } = useAuth();
  const upcoming = useMyAppointments('upcoming');
  const hasUpcoming = (upcoming.data?.length ?? 0) > 0;
  const past = useMyAppointments('past');
  const hasPast = (past.data?.length ?? 0) > 0;

  const goToDoctors = (specialty: Specialty) =>
    navigate(`/book/doctor?specialtyId=${specialty.id}`);

  return (
    <div className="space-y-10">
      <section className="rounded-card bg-linear-to-br from-brand-600 to-brand-700 px-6 py-8 text-white">
        <p className="text-sm text-brand-100">
          {justRegistered ? t('dashboard.greetingNew') : t('dashboard.greetingReturning')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{user?.name ?? user?.phone}</h1>
        <p className="mt-2 max-w-lg text-sm text-brand-50">
          {hasUpcoming ? t('dashboard.subtitleUpcoming') : t('dashboard.subtitleEmpty')}
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/book/specialty')}>
          {t('dashboard.bookCta')}
        </Button>
      </section>

      {upcoming.isPending && <Skeleton className="h-28" />}
      {hasUpcoming && (
        <section>
          <SectionHeading>{t('dashboard.upcoming')}</SectionHeading>
          <AppointmentList scope="upcoming" emptyTitle={t('appointments.emptyUpcomingTitle')} />
        </section>
      )}

      {hasPast && (
        <section>
          <div className="flex items-baseline justify-between">
            <SectionHeading>{t('dashboard.recentVisits')}</SectionHeading>
            <Link
              to="/appointments"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {t('dashboard.viewAllAppointments')}
            </Link>
          </div>
          <AppointmentList scope="past" limit={3} emptyTitle={t('appointments.emptyPastTitle')} />
        </section>
      )}

      <section>
        <SectionHeading>{t('dashboard.findCare')}</SectionHeading>
        <SearchBar />
      </section>

      <section>
        <SectionHeading>{t('dashboard.browseSpecialties')}</SectionHeading>
        <SpecialtiesGrid onSelect={goToDoctors} />
      </section>
    </div>
  );
};
