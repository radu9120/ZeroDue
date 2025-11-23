import { DashboardBusinessStats } from "@/types";
import BusinessCard from "./BusinessCard";
import ProfileSetupFlow from "../Business/ProfileSetupFlow";
import ActiveBusinessSyncer from "./ActiveBusinessSyncer";

export default function BusinessGrid({
  dashboardData,
}: {
  dashboardData: DashboardBusinessStats[];
}) {
  if (dashboardData.length === 0) {
    return <ProfileSetupFlow />;
  }

  const hasSingleCard = dashboardData.length === 1;
  const gridClassName = hasSingleCard
    ? "grid grid-cols-1 gap-8 max-w-4xl mx-auto w-full"
    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8";

  return (
    <>
      <ActiveBusinessSyncer dashboardData={dashboardData} />
      <div className={gridClassName}>
        {dashboardData.map((company) => (
          <BusinessCard key={company.id} company={company} />
        ))}
        {/* You might want to add an "+ Add New Company" card here as well,
            if the user's plan allows creating more companies and totalBusinesses > 0.
            This would be similar to the CustomModal setup in DashboardHeader.
            For now, this example assumes DashboardHeader handles adding subsequent companies.
        */}
      </div>
    </>
  );
}
