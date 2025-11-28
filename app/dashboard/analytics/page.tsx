import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import type { SearchParams } from "@/types";
import { redirect } from "next/navigation";
import PlanWatcher from "../../../components/PlanWatcher";
import type { AppPlan } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/plan";
import {
  getOverview,
  getRevenueSeries,
  getInvoiceStatusBreakdown,
} from "@/lib/actions/analytics.actions";
import {
  getBusiness,
  getUserBusinesses,
  getBusinessStats,
} from "@/lib/actions/business.actions";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import { ExportReportButton } from "@/components/Business/ExportReportButton";

export const revalidate = 0;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;
  if (!business_id) redirect("/dashboard");

  const bizId = Number(business_id);
  const [
    overview,
    revenueData,
    invoiceStatusData,
    business,
    allBusinesses,
    userPlan,
    businessStats,
  ] = await Promise.all([
    getOverview(bizId, 30),
    getRevenueSeries(bizId, 6),
    getInvoiceStatusBreakdown(bizId, 90),
    getBusiness({ business_id: bizId }),
    getUserBusinesses(),
    getCurrentPlan(),
    getBusinessStats({ business_id: bizId }),
  ]);

  if (!business) redirect("/dashboard");

  const maxRevenue = Math.max(0, ...revenueData.map((d) => d.amount));
  const totalInvoices = invoiceStatusData.reduce(
    (sum, it) => sum + it.count,
    0
  );
  let currentAngle = 0;
  const pieSlices = invoiceStatusData.map((item) => {
    const percentage = totalInvoices ? (item.count / totalInvoices) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const slice = {
      ...item,
      percentage: percentage.toFixed(1),
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    } as any;
    currentAngle += angle;
    return slice;
  });
  const avgInvoice = overview.total
    ? overview.totalValueAll / overview.total
    : 0;
  const collectionRate = overview.total
    ? Math.round((overview.paid / overview.total) * 100)
    : 0;

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="analytics"
      userPlan={userPlan as AppPlan}
      pendingInvoicesCount={businessStats?.total_pending_invoices || 0}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 text-white">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Analytics & Reports
              </h1>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
                Track your business performance and insights.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-secondary-text dark:text-slate-400" />
            <span className="text-sm text-secondary-text dark:text-slate-400">
              Last 30 days
            </span>
          </div>
          <ExportReportButton
            businessName={business.name}
            overview={overview}
            revenueData={revenueData}
            invoiceStatusData={invoiceStatusData}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  £{overview.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Invoices Sent
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {overview.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent dark:from-purple-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Average Invoice
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  £{avgInvoice.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Collection Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {collectionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                <PieChart className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
              Revenue Trend
            </h3>
            {maxRevenue === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No revenue data yet
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Revenue will appear here once you have paid invoices
                </p>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueData.map((item, i) => {
                  const height = maxRevenue
                    ? (item.amount / maxRevenue) * 100
                    : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-full flex items-end overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-600 dark:to-blue-400 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-300 rounded-t-lg"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        >
                          {height > 15 && (
                            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              £{item.amount.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Invoice Status */}
          <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
              Invoice Status
            </h3>
            <div className="relative h-64 w-64 mx-auto">
              <svg
                viewBox="0 0 100 100"
                className="transform -rotate-90 w-full h-full"
              >
                {pieSlices.map((slice, i) => {
                  const x1 =
                    50 + 40 * Math.cos((Math.PI * slice.startAngle) / 180);
                  const y1 =
                    50 + 40 * Math.sin((Math.PI * slice.startAngle) / 180);
                  const x2 =
                    50 + 40 * Math.cos((Math.PI * slice.endAngle) / 180);
                  const y2 =
                    50 + 40 * Math.sin((Math.PI * slice.endAngle) / 180);
                  const largeArcFlag =
                    slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                  const pathData = [
                    `M 50 50`,
                    `L ${x1} ${y1}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`,
                  ].join(" ");
                  const colors: Record<string, string> = {
                    paid: "#10B981",
                    pending: "#F59E0B",
                    overdue: "#EF4444",
                    draft: "#6B7280",
                  };
                  return (
                    <path
                      key={i}
                      d={pathData}
                      fill={colors[slice.status.toLowerCase()] || "#cbd5e1"}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                })}
                {/* Center hole for donut chart */}
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  className="fill-white dark:fill-slate-900"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {totalInvoices}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invoices
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {pieSlices.map((slice, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        slice.status.toLowerCase() === "paid"
                          ? "bg-emerald-500"
                          : slice.status.toLowerCase() === "pending"
                            ? "bg-amber-500"
                            : slice.status.toLowerCase() === "overdue"
                              ? "bg-red-500"
                              : "bg-slate-400"
                      }`}
                    />
                    <span className="capitalize text-slate-500 dark:text-slate-300">
                      {slice.status}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {slice.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PlanWatcher initialPlan={userPlan} />
    </DashboardShell>
  );
}
