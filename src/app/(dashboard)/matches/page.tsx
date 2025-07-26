// src\app\(dashboard)\matches\page.tsx

import { DashboardHeader } from "../components/dashboard-header";
import DynamicMatchPage from "../components/DynamicMatchPage";

export default function VotingPage() {
  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8 space-y-6'>
        <DynamicMatchPage/>
      </div>
    </div>
  );
}
