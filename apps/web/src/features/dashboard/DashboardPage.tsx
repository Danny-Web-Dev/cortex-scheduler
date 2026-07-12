import { DashboardHero } from './DashboardHero';
import { UpcomingAppointmentsSection } from './UpcomingAppointmentsSection';
import { RecentVisitsSection } from './RecentVisitsSection';
import { FindCareSection } from './FindCareSection';
import { BrowseSpecialtiesSection } from './BrowseSpecialtiesSection';

export const DashboardPage = () => (
  <div className="space-y-10">
    <DashboardHero />
    <UpcomingAppointmentsSection />
    <RecentVisitsSection />
    <FindCareSection />
    <BrowseSpecialtiesSection />
  </div>
);
