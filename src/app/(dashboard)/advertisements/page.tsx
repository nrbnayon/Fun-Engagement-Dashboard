import AdvertisementSection from "../components/AdvertisementSection";
import { DashboardHeader } from "../components/dashboard-header";

export default function AdvertisementsPage() {
  return (
    <div>
      <DashboardHeader />
      <div className="p-4 md:p-8 space-y-6">
        <AdvertisementSection itemsPerPage={12} />
      </div>
    </div>
  );
}
