// src\app\(dashboard)\overview\page.tsx
import { DashboardHeader } from "../components/dashboard-header";
import MatchesOverview from "../components/MatchesOverview";
import StatsCards from "../components/StatsCards";
import VotingList from "../components/VotingList";

export default function OverviewPage() {
  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8 space-y-6'>
        <StatsCards />
        <VotingList limit={5} />
        <MatchesOverview limit={5} />
      </div>
    </div>
  );
}
