import { Link } from 'react-router-dom';
import { Button, PageHeading, SectionHeading } from '@/components/ui';
import { AppointmentList } from './AppointmentList';

export const AppointmentsPage = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <PageHeading title="My appointments" className="mb-0" />
      <Link to="/book/specialty">
        <Button>Book new</Button>
      </Link>
    </div>

    <section>
      <SectionHeading>Upcoming</SectionHeading>
      <AppointmentList
        scope="upcoming"
        emptyTitle="No upcoming appointments"
        emptyDescription="Book a visit to see it here."
      />
    </section>

    <section>
      <SectionHeading>Past</SectionHeading>
      <AppointmentList scope="past" emptyTitle="No past appointments yet" />
    </section>
  </div>
);
