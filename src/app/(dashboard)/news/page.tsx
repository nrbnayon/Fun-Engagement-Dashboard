// src\app\(dashboard)\matchs\page.tsx

import { DashboardHeader } from "../components/dashboard-header";
import NewsListPage from "../components/NewsListPage";

export default function NewsPage() {
  return (
    <div>
      <DashboardHeader />
      <div className="p-4 md:p-8 space-y-6">
        <NewsListPage itemsPerPage={12} />
      </div>
    </div>
  );
}
