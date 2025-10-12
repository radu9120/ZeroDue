import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/actions/business.actions";
import { DashboardBusinessStats } from "@/types";
import Bounded from "@/components/ui/bounded";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import BusinessGrid from "@/components/Dashboard/BusinessGrid";
import BusinessAvailabilty from "@/components/Dashboard/BusinessAvailability";
import { AppPlan } from "@/lib/utils";
import { getCurrentMonthInvoiceCountForUser } from "@/lib/actions/invoice.actions";
import PlanWatcher from "../../components/PlanWatcher";
import { getCurrentPlan } from "@/lib/plan";

// Always render this page dynamically to reflect plan changes immediately
export const revalidate = 0;

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

  // Resolve plan using Clerk has() with fallback
  const userPlan: AppPlan = await getCurrentPlan();

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
      {/* Watches plan changes via /api/plan and refreshes the page when it changes */}
      <PlanWatcher initialPlan={userPlan} />
    </main>
  );
}
