import BusinessDashboard from "@/components/Business/BusinessDashboard";
import Bounded from "@/components/ui/bounded";
import { getBusiness } from "@/lib/actions/business.actions";
import { BusinessDashboardPageProps, UserActivityLog } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getBusinessStats } from "../../../lib/actions/business.actions";
import {
  getCurrentMonthInvoiceCountForUser,
  getInvoicesList,
} from "@/lib/actions/invoice.actions";
import QuickActions from "@/components/Business/QuickActions";
import InvoiceTable from "@/components/Business/InvoiceTable";
import RecentActivity from "@/components/Business/RecentActivity";
import { getRecentBusinessActivity } from "@/lib/actions/userActivity.actions";
import InvoiceAvailability from "@/components/Business/InvoiceAvailability";
import { type AppPlan } from "@/lib/utils";
import PlanWatcher from "../../../components/PlanWatcher";
import { getCurrentPlan } from "@/lib/plan";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<BusinessDashboardPageProps>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userPlan: AppPlan = await getCurrentPlan();
  const searchVars = await searchParams;
  const {
    business_id,
    page = "1",
    searchTerm = "",
    filter = "",
  } = await searchVars;

  const businessId = Number(business_id);

  // const business_id = searchVars.business_id
  // const name = searchVars.name

  if (!businessId || Number.isNaN(businessId)) return notFound();

  let business: Awaited<ReturnType<typeof getBusiness>> = null;
  try {
    business = await getBusiness({ business_id: businessId });
  } catch (err) {
    console.error("Error fetching business:", err);
    return notFound();
  }

  if (!business) {
    return notFound();
  }

  let businessStats;
  try {
    businessStats = await getBusinessStats({
      business_id: businessId,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return notFound();
  }

  let invoices;

  try {
    invoices = await getInvoicesList({
      business_id: businessId,
      page: Number(page),
      searchTerm,
      filter,
    });
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return notFound();
  }

  // Fetch counts to enforce plan limits (free total and pro monthly)
  let totalInvoicesAll = 0;
  let monthCount = 0;
  try {
    const countOnly = await (
      await import("@/lib/actions/invoice.actions")
    ).getInvoices(businessId, {
      search: "",
      status: "all",
      page: 1,
      limit: 1,
    });
    totalInvoicesAll = countOnly?.totalCount || 0;
    monthCount = await getCurrentMonthInvoiceCountForUser();
  } catch (e) {
    totalInvoicesAll = Array.isArray(invoices) ? invoices.length : 0; // fallback
  }

  let recentActivities: UserActivityLog[] = [];

  try {
    recentActivities = await getRecentBusinessActivity({
      business_id: businessId,
    });
  } catch (error) {
    console.error("Failed to load activity log:", error);
    // return notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-800 transition-colors">
      <Bounded>
        <BusinessDashboard
          business={business}
          userPlan={userPlan}
          stats={businessStats}
          createDisabled={
            (userPlan === "free_user" && monthCount >= 3) ||
            (userPlan === "professional" && monthCount >= 15)
          }
        />
        <QuickActions companyId={businessId} />
        <InvoiceTable
          invoices={invoices}
          business_id={businessId}
          userPlan={userPlan}
        />
        {recentActivities.length > 0 && (
          <RecentActivity recentActivities={recentActivities} />
        )}
        <InvoiceAvailability
          userPlan={userPlan}
          invoicesLength={monthCount}
          companiesLength={1}
        />
      </Bounded>
      <PlanWatcher initialPlan={userPlan} />
    </main>
  );
}
