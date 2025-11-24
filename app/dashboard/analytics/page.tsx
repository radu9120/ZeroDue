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
import { getBusiness, getUserBusinesses } from "@/lib/actions/business.actions";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";

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
  ] = await Promise.all([
    getOverview(bizId, 30),
    getRevenueSeries(bizId, 6),
    getInvoiceStatusBreakdown(bizId, 90),
    getBusiness({ business_id: bizId }),
    getUserBusinesses(),
    getCurrentPlan(),
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
  const avgInvoice = overview.total ? overview.totalAmount / overview.total : 0;
  const collectionRate = overview.total
    ? Math.round((overview.paid / overview.total) * 100)
    : 0;

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="analytics"
      userPlan={userPlan as AppPlan}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-header-text dark:text-slate-100">
                Analytics & Reports
              </h1>
              <p className="text-sm md:text-base text-secondary-text dark:text-slate-400 mt-1">
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
          <Button
            variant="secondary"
            className="border-blue-200 dark:border-slate-700 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text dark:text-slate-400 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-header-text dark:text-slate-100">
                  £{overview.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text dark:text-slate-400 text-sm font-medium">
                  Invoices Sent
                </p>
                <p className="text-2xl font-bold text-header-text dark:text-slate-100">
                  {overview.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text dark:text-slate-400 text-sm font-medium">
                  Average Invoice
                </p>
                <p className="text-2xl font-bold text-header-text dark:text-slate-100">
                  £{avgInvoice.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text dark:text-slate-400 text-sm font-medium">
                  Collection Rate
                </p>
                <p className="text-2xl font-bold text-header-text dark:text-slate-100">
                  {collectionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-header-text dark:text-slate-100 mb-6">
              Revenue Trend
            </h3>
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
                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-t-lg relative h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-blue-500 dark:bg-blue-600 transition-all duration-500 group-hover:bg-blue-400"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-secondary-text dark:text-slate-400">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice Status */}
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-header-text dark:text-slate-100 mb-6">
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
                    paid: "#22c55e",
                    pending: "#eab308",
                    overdue: "#ef4444",
                    draft: "#94a3b8",
                  };
                  return (
                    <path
                      key={i}
                      d={pathData}
                      fill={colors[slice.status] || "#cbd5e1"}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                })}
                {/* Center hole for donut chart */}
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  className="fill-white dark:fill-slate-800"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                    {totalInvoices}
                  </span>
                  <p className="text-xs text-secondary-text dark:text-slate-400">
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
                        slice.status === "paid"
                          ? "bg-green-500"
                          : slice.status === "pending"
                            ? "bg-yellow-500"
                            : slice.status === "overdue"
                              ? "bg-red-500"
                              : "bg-slate-400"
                      }`}
                    />
                    <span className="capitalize text-secondary-text dark:text-slate-300">
                      {slice.status}
                    </span>
                  </div>
                  <span className="font-medium text-header-text dark:text-slate-100">
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
