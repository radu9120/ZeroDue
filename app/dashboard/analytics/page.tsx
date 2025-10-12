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
  const [overview, revenueData, invoiceStatusData] = await Promise.all([
    getOverview(bizId, 30),
    getRevenueSeries(bizId, 6),
    getInvoiceStatusBreakdown(bizId, 90),
  ]);

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
  const userPlan: AppPlan = await getCurrentPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-header-text">
                Analytics & Reports
              </h1>
              <p className="text-secondary-text mt-1">
                Track your business performance and insights.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-secondary-text" />
            <span className="text-sm text-secondary-text">Last 30 days</span>
          </div>
          <Button variant="secondary" className="border-blue-200">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-header-text">
                  £{overview.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Invoices Sent
                </p>
                <p className="text-2xl font-bold text-header-text">
                  {overview.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Average Invoice
                </p>
                <p className="text-2xl font-bold text-header-text">
                  £{avgInvoice.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Collection Rate
                </p>
                <p className="text-2xl font-bold text-header-text">
                  {collectionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-header-text">
                Revenue Trend
              </h2>
              <BarChart3 className="h-5 w-5 text-secondary-text" />
            </div>
            <div className="h-64 p-4">
              <div className="h-full flex items-end justify-between gap-4">
                {revenueData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg"
                      style={{
                        height: `${
                          maxRevenue ? (d.amount / maxRevenue) * 100 : 0
                        }%`,
                        minHeight: "20px",
                      }}
                    />
                    <span className="text-sm text-secondary-text mt-2">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invoice Status Pie Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-header-text">
                Invoice Status
              </h2>
              <PieChart className="h-5 w-5 text-secondary-text" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="relative">
                <svg width="200" height="200" className="transform -rotate-90">
                  {pieSlices.map((slice: any, i: number) => {
                    const radius = 80;
                    const centerX = 100;
                    const centerY = 100;
                    const startAngleRad = (slice.startAngle * Math.PI) / 180;
                    const endAngleRad = (slice.endAngle * Math.PI) / 180;
                    const x1 = centerX + radius * Math.cos(startAngleRad);
                    const y1 = centerY + radius * Math.sin(startAngleRad);
                    const x2 = centerX + radius * Math.cos(endAngleRad);
                    const y2 = centerY + radius * Math.sin(endAngleRad);
                    const largeArcFlag =
                      slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      "Z",
                    ].join(" ");
                    return (
                      <path
                        key={i}
                        d={pathData}
                        fill={slice.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
                {/* Legend */}
                <div className="absolute -right-32 top-0 space-y-2">
                  {pieSlices.map((slice: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-sm text-primary-text">
                        {slice.status}: {slice.percentage}% (
                        {invoiceStatusData[i].count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 mt-8">
          <h2 className="text-xl font-semibold text-header-text mb-6">
            Quick Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {invoiceStatusData.map((item, index) => (
              <div
                key={index}
                className="text-center p-4 bg-blue-50 rounded-lg"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </span>
                </div>
                <p className="text-sm font-medium text-secondary-text">
                  {item.status} Invoices
                </p>
                <p className="text-xs text-secondary-text mt-1">
                  {((item.count / (totalInvoices || 1)) * 100).toFixed(1)}% of
                  total
                </p>
              </div>
            ))}
          </div>
        </div>

        <PlanWatcher initialPlan={userPlan} />
      </div>
    </div>
  );
}
