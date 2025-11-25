import BusinessDashboard from "@/components/Business/BusinessDashboard";
import Bounded from "@/components/ui/BoundedSection";
import { getBusiness, getUserBusinesses } from "@/lib/actions/business.actions";
import { BusinessDashboardPageProps, UserActivityLog } from "@/types";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getBusinessStats } from "../../../lib/actions/business.actions";
import {
  getCurrentMonthInvoiceCountForUser,
  getInvoicesList,
  getMonthlyRevenue,
} from "@/lib/actions/invoice.actions";
import QuickActions from "@/components/Business/QuickActions";
import InvoiceTable from "@/components/Business/InvoiceTable";
import RecentActivity from "@/components/Business/RecentActivity";
import { getRecentBusinessActivity } from "@/lib/actions/userActivity.actions";
import InvoiceAvailability from "@/components/Business/InvoiceAvailability";
import { type AppPlan } from "@/lib/utils";
import PlanWatcher from "../../../components/PlanWatcher";
import { getCurrentPlan } from "@/lib/plan";
import ModernDashboard from "@/components/Business/ModernDashboard";

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
  let allBusinesses: Awaited<ReturnType<typeof getUserBusinesses>> = [];
  try {
    [business, allBusinesses] = await Promise.all([
      getBusiness({ business_id: businessId }),
      getUserBusinesses(),
    ]);
  } catch (error) {
    console.error("Error loading business:", error);
    return notFound();
  }

  if (!business) return notFound();

  let businessStats = null;
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

  let monthlyRevenue: { name: string; total: number }[] = [];
  try {
    monthlyRevenue = await getMonthlyRevenue(businessId);
  } catch (err) {
    console.error("Error fetching monthly revenue:", err);
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
    <main className="min-h-screen bg-slate-950 transition-colors">
      <ModernDashboard
        business={business}
        stats={businessStats}
        monthlyRevenue={monthlyRevenue}
        invoices={invoices}
        allBusinesses={allBusinesses}
        recentActivities={recentActivities}
        userPlan={userPlan}
      />
      <PlanWatcher initialPlan={userPlan} />
    </main>
  );
}
