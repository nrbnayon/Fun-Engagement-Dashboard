// src\app\(dashboard)\matchs\page.tsx

import { DashboardHeader } from "../components/dashboard-header";
import MatchesListPage from "../components/MatchesListPage";

export default function VotingPage() {
  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8 space-y-6'>
        <MatchesListPage itemsPerPage={12} />
      </div>
    </div>
  );
}
