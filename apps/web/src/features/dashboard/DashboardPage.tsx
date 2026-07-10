import { useNavigate } from 'react-router-dom';
import type { Specialty } from '@cortex/shared';
import { Button, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks';
import { SpecialtiesGrid } from '@/features/catalog';
import { SearchBar } from '@/features/search';
import { AppointmentList, useMyAppointments } from '@/features/appointments';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const upcoming = useMyAppointments('upcoming');
  const hasUpcoming = (upcoming.data?.length ?? 0) > 0;

  const goToDoctors = (specialty: Specialty) => navigate(`/book/doctor?specialtyId=${specialty.id}`);

  return (
    <div className="space-y-10">
      <section className="rounded-[var(--radius-card)] bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-8 text-white">
        <p className="text-sm text-brand-100">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold">{user?.phone}</h1>
        <p className="mt-2 max-w-lg text-sm text-brand-50">
          {hasUpcoming
            ? 'Here is what’s coming up. You can reschedule or cancel any time.'
            : 'Book your first visit — pick a specialty below and choose a time that works for you.'}
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/book/specialty')}
        >
          Book an appointment
        </Button>
      </section>

      {upcoming.isPending && <Skeleton className="h-28" />}
      {hasUpcoming && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
            Upcoming
          </h2>
          <AppointmentList scope="upcoming" emptyTitle="No upcoming appointments" />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          Find care
        </h2>
        <SearchBar />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
          Browse specialties
        </h2>
        <SpecialtiesGrid onSelect={goToDoctors} />
      </section>
    </div>
  );
};
