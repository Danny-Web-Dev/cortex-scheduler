import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { AppointmentList } from './AppointmentList';

export const AppointmentsPage = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-ink-900">My appointments</h1>
      <Link to="/book/specialty">
        <Button>Book new</Button>
      </Link>
    </div>

    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">Upcoming</h2>
      <AppointmentList
        scope="upcoming"
        emptyTitle="No upcoming appointments"
        emptyDescription="Book a visit to see it here."
      />
    </section>

    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">Past</h2>
      <AppointmentList scope="past" emptyTitle="No past appointments yet" />
    </section>
  </div>
);
