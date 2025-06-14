// src\app\(dashboard)\matches\page.tsx

import { DashboardHeader } from "../components/dashboard-header";
import FanRankingPage from "../components/FanRankingPage";

export default function FanRanking() {
  return (
    <div>
      <DashboardHeader />
      <div className="p-4 md:p-8 space-y-6">
        <FanRankingPage paginate={true} itemsPerPage={12} title={true} />
      </div>
    </div>
  );
}
