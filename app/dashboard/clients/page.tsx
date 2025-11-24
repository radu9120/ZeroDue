import ClientManagement from "@/components/Clients/ClientManagement";
import Bounded from "@/components/ui/BoundedSection";
import { getAllClients } from "@/lib/actions/client.actions";
import { getBusiness, getUserBusinesses } from "@/lib/actions/business.actions";
import { SearchParams } from "@/types";
import { redirect } from "next/navigation";
import PlanWatcher from "../../../components/PlanWatcher";
import { currentUser } from "@clerk/nextjs/server";
import { type AppPlan } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/plan";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>; // Make searchParams a Promise it was failing deployment because it was not awaited
}) {
  const filter = await searchParams; // Now this will work correctly
  const business_id = filter.business_id;
  const searchTerm = filter.searchTerm || "";

  if (!business_id) redirect("/dashboard");

  const [clients, userPlan, business, allBusinesses] = await Promise.all([
    getAllClients({ business_id: business_id }),
    getCurrentPlan(),
    getBusiness({ business_id: parseInt(business_id) }),
    getUserBusinesses(),
  ]);

  if (!business) redirect("/dashboard");

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="clients"
      userPlan={userPlan}
    >
      <ClientManagement clients={clients} business_id={business_id} />
      <PlanWatcher initialPlan={userPlan} />
    </DashboardShell>
  );
}
