import ClientManagement from "@/components/Clients/ClientManagement";
import Bounded from "@/components/ui/BoundedSection";
import { getAllClients } from "@/lib/actions/client.actions";
import {
  getBusiness,
  getUserBusinesses,
  getBusinessStats,
} from "@/lib/actions/business.actions";
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
  const rawBusinessId = String(filter.business_id);
  const businessIdNumber = parseInt(rawBusinessId);
  const searchTerm = filter.searchTerm || "";

  if (isNaN(businessIdNumber)) redirect("/dashboard");

  const [clients, userPlan, business, allBusinesses, businessStats] =
    await Promise.all([
      getAllClients({ business_id: businessIdNumber, searchTerm: searchTerm }),
      getCurrentPlan(),
      getBusiness({ business_id: businessIdNumber }),
      getUserBusinesses(),
      getBusinessStats({ business_id: businessIdNumber }),
    ]);

  if (!business) redirect("/dashboard");

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="clients"
      userPlan={userPlan}
      pendingInvoicesCount={businessStats?.total_pending_invoices || 0}
    >
      <ClientManagement clients={clients} business_id={businessIdNumber} />
      <PlanWatcher initialPlan={userPlan} />
    </DashboardShell>
  );
}
