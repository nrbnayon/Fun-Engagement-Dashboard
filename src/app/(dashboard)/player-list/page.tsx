import { DashboardHeader } from "../components/dashboard-header";
import PlayerListPage from "../components/PlayerListPage";

// src\app\(dashboard)\player-list\page.tsx
export default function PlayerList() {
  return (
    <div>
      <DashboardHeader />
      <div className="p-4 md:p-8 space-y-6">
        <PlayerListPage itemsPerPage={12} />
      </div>
    </div>
  );
}
