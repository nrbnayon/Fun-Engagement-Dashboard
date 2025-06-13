import { DashboardHeader } from "../components/dashboard-header";
import { MainOverviewContent } from "../components/MainOverviewContent";
import StatsCards from "../components/StatsCards";
import VotingList from "../components/VotingList";

// src/app/(dashboard)/overview/page.tsx
export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <DashboardHeader />
      <StatsCards />
      <VotingList/>
      <MainOverviewContent />
    </div>
  );
}
