"use client";

import { StatsCards } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { RecentInvoices } from "./RecentInvoices";
import { RecentActivityList } from "./RecentActivityList";
import { getCurrencySymbol, normalizeCurrencyCode } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardShell } from "./DashboardShell";

interface ModernDashboardProps {
  business: any;
  stats: any;
  monthlyRevenue: any[];
  invoices: any[];
  allBusinesses?: any[];
  recentActivities?: any[];
  userPlan?: "free_user" | "professional" | "enterprise";
}

export default function ModernDashboard({
  business,
  stats,
  monthlyRevenue,
  invoices,
  allBusinesses = [],
  recentActivities = [],
  userPlan = "free_user",
}: ModernDashboardProps) {
  const currencyCode = normalizeCurrencyCode(business.currency);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const dashboardStats = {
    total_revenue: Number(stats?.total_paid_amount || 0),
    pending_amount: Number(stats?.total_pending_amount || 0),
    overdue_amount: Number(stats?.total_overdue_amount || 0),
  };

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="dashboard"
      pendingInvoicesCount={Number(stats?.total_pending_invoices || 0)}
      userPlan={userPlan}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <Link
          href={`/dashboard/invoices/new?business_id=${business.id}`}
          className="md:hidden"
        >
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <StatsCards stats={dashboardStats} currencySymbol={currencySymbol} />

      <div className="grid gap-6 md:grid-cols-7">
        <RevenueChart data={monthlyRevenue} />
        <RecentInvoices invoices={invoices} currencySymbol={currencySymbol} />
        <RecentActivityList recentActivities={recentActivities} />
      </div>
    </DashboardShell>
  );
}
