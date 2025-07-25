// src\app\(dashboard)\voting\page.tsx

import { DashboardHeader } from "../components/dashboard-header";
import VotingList from "../components/VotingList";

export default function VotingPage() {
  return (
    <div>
      <DashboardHeader />
      <div className='p-4 md:p-8 space-y-6'>
        <VotingList paginate={true} itemsPerPage={12} />
      </div>
    </div>
  );
}