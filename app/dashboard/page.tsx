import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/actions/business.actions";
import { DashboardBusinessStats } from "@/types";
import Bounded from "@/components/ui/bounded";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import BusinessGrid from "@/components/Dashboard/BusinessGrid";
import BusinessAvailabilty from "@/components/Dashboard/BusinessAvailability";
import { AppPlan, normalizePlan } from "@/lib/utils";
import { getCurrentMonthInvoiceCountForUser } from "@/lib/actions/invoice.actions";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let dashboardData: DashboardBusinessStats[] = [];

  try {
    dashboardData = await getDashboardStats();
  } catch (error) {
    console.error("Error loading businesses:", error);
    return notFound();
  }

  // Resolve plan from Clerk metadata only (single source of truth)
  const user = await currentUser();
  const metaPlanRaw = (user?.publicMetadata as any)?.plan;
  const userPlan: AppPlan = normalizePlan(metaPlanRaw || "free_user");

  const monthlyInvoices = await getCurrentMonthInvoiceCountForUser();

  return (
    <main>
      <Bounded>
        <DashboardHeader
          userPlan={userPlan}
          totalBusinesses={dashboardData.length}
        />
        <BusinessGrid dashboardData={dashboardData} />
        <BusinessAvailabilty
          userPlan={userPlan}
          companiesLengh={dashboardData.length}
          totalInvoices={dashboardData.reduce(
            (acc, item) => acc + Number(item.totalinvoices),
            0
          )}
          monthlyInvoices={monthlyInvoices}
        />
      </Bounded>
    </main>
  );
}
