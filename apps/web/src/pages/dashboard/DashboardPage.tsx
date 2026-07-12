import {
  DashboardHero,
  UpcomingAppointmentsSection,
  RecentVisitsSection,
  FindCareSection,
  BrowseSpecialtiesSection,
} from '@/components/dashboard';

export const DashboardPage = () => (
  <div className="space-y-10">
    <DashboardHero />
    <UpcomingAppointmentsSection />
    <RecentVisitsSection />
    <FindCareSection />
    <BrowseSpecialtiesSection />
  </div>
);
