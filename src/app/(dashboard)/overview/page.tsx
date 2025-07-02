// src\app\(dashboard)\overview\page.tsx
import { DashboardHeader } from "../components/dashboard-header";
import DynamicMatchesTable from "../components/DynamicMatchesTable";
import StatsCards from "../components/StatsCards";
import VotingList from "../components/VotingList";

export default function OverviewPage() {
  return (
    <div>
      <DashboardHeader />
      <div className="p-4 md:p-8 space-y-6">
        <StatsCards />
        <VotingList limit={5} />
        <DynamicMatchesTable limit={5} />
      </div>
    </div>
  );
}
