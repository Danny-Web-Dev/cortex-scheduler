import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config';
import { useAuth } from '@/hooks';
import { useMyAppointments } from '@/hooks/appointments';

export const DashboardHero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, justRegistered } = useAuth();
  const upcoming = useMyAppointments('upcoming');
  const hasUpcoming = (upcoming.data?.length ?? 0) > 0;

  return (
    <section className="rounded-card bg-linear-to-br from-brand-600 to-brand-700 px-6 py-8 text-white">
      <p className="text-sm text-brand-100">
        {justRegistered ? t('dashboard.greetingNew') : t('dashboard.greetingReturning')}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{user?.name ?? user?.phone}</h1>
      <p className="mt-2 max-w-lg text-sm text-brand-50">
        {hasUpcoming ? t('dashboard.subtitleUpcoming') : t('dashboard.subtitleEmpty')}
      </p>
      <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.book.specialty)}>
        {t('dashboard.bookCta')}
      </Button>
    </section>
  );
};
