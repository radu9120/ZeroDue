import BusinessDashboard from "@/components/Business/BusinessDashboard";
import Bounded from "@/components/ui/bounded";
import { getBusiness } from "@/lib/actions/business.actions";
import { BusinessDashboardPageProps, UserActivityLog } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getBusinessStats } from "../../../lib/actions/business.actions";
import {
  getCurrentMonthInvoiceCountForBusiness,
  getInvoicesList,
} from "@/lib/actions/invoice.actions";
import BusinessStats from "@/components/Business/BusinessStats";
import QuickActions from "@/components/Business/QuickActions";
import InvoiceTable from "@/components/Business/InvoiceTable";
import RecentActivity from "@/components/Business/RecentActivity";
import { getRecentBusinessActivity } from "@/lib/actions/userActivity.actions";
import InvoiceAvailability from "@/components/Business/InvoiceAvailability";
import { normalizePlan, type AppPlan } from "@/lib/utils";
import PlanWatcher from "../../../components/PlanWatcher";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<BusinessDashboardPageProps>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const metaPlanRaw = (user?.publicMetadata as any)?.plan;
  const userPlan: AppPlan = normalizePlan(metaPlanRaw || "free_user");
  const searchVars = await searchParams;
  const {
    business_id,
    name,
    page = "1",
    searchTerm = "",
    filter = "",
  } = await searchVars;

  // const business_id = searchVars.business_id
  // const name = searchVars.name

  if (!business_id || !name) return notFound();

  let business;
  try {
    business = await getBusiness({ business_id: Number(business_id) });
  } catch (err) {
    console.error("Error fetching business:", err);
    return notFound();
  }

  if (
    business.name.toLowerCase().replace(/\s+/g, "%") !==
    name.toLowerCase().replace(/\s+/g, "%")
  )
    return notFound();

  let businessStats;
  try {
    businessStats = await getBusinessStats({
      business_id: Number(business_id),
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return notFound();
  }

  let invoices;

  try {
    invoices = await getInvoicesList({
      business_id: Number(business_id),
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
    ).getInvoices(Number(business_id), {
      search: "",
      status: "all",
      page: 1,
      limit: 1,
    });
    totalInvoicesAll = countOnly?.totalCount || 0;
    monthCount = await getCurrentMonthInvoiceCountForBusiness(
      Number(business_id)
    );
  } catch (e) {
    totalInvoicesAll = Array.isArray(invoices) ? invoices.length : 0; // fallback
  }

  let recentActivities: UserActivityLog[] = [];

  try {
    recentActivities = await getRecentBusinessActivity({
      business_id: business_id,
    });
  } catch (error) {
    console.error("Failed to load activity log:", error);
    // return notFound();
  }

  return (
    <main>
      <Bounded>
        <BusinessDashboard
          business={business}
          userPlan={userPlan}
          createDisabled={
            (userPlan === "free_user" && totalInvoicesAll >= 1) ||
            (userPlan === "professional" && monthCount >= 10)
          }
        />
        <BusinessStats statistic={businessStats} />
        <QuickActions companyId={business_id} />
        <InvoiceAvailability
          userPlan={userPlan}
          invoicesLength={totalInvoicesAll}
          companiesLength={1}
        />
        <InvoiceTable invoices={invoices} business_id={business_id} />
        {recentActivities.length > 0 && (
          <RecentActivity recentActivities={recentActivities} />
        )}
      </Bounded>
      <PlanWatcher initialPlan={userPlan} />
    </main>
  );
}
