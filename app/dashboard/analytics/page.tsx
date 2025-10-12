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
  TrendingDown,
} from "lucide-react";
import { SearchParams } from "@/types";
import { redirect } from "next/navigation";
import PlanWatcher from "../../../components/PlanWatcher";
import { currentUser } from "@clerk/nextjs/server";
import { normalizePlan, type AppPlan } from "@/lib/utils";

export const revalidate = 0;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>; // Make searchParams a Promise it was failing deployment because it was not awaited
}) {

  const searchVal = await searchParams;
  const business_id = searchVal.business_id

  if (!business_id) redirect('/dashboard')
  
  

  // const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Dummy data for charts
  const revenueData = [
    { month: "Jan", amount: 3200 },
    { month: "Feb", amount: 2800 },
    { month: "Mar", amount: 4100 },
    { month: "Apr", amount: 3600 },
    { month: "May", amount: 4250 },
    { month: "Jun", amount: 3800 },
  ];

  const invoiceStatusData = [
    { status: "Paid", count: 18, color: "#10B981" },
    { status: "Pending", count: 3, color: "#F59E0B" },
    { status: "Overdue", count: 3, color: "#EF4444" },
    { status: "Draft", count: 2, color: "#6B7280" },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount));

  // Calculate pie chart percentages
  const totalInvoices = invoiceStatusData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  let currentAngle = 0;

  const pieSlices = invoiceStatusData.map((item) => {
    const percentage = (item.count / totalInvoices) * 100;
    const angle = (percentage / 100) * 360;
    const slice = {
      ...item,
      percentage: percentage.toFixed(1),
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });

  const user = await currentUser();
  const metaPlanRaw = (user?.publicMetadata as any)?.plan;
  const userPlan: AppPlan = normalizePlan(metaPlanRaw || "free_user");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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

        {/* Time Period Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-secondary-text" />
            {/* <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary-text"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select> */}
          </div>
          <Button variant="secondary" className="border-blue-200">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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
                <p className="text-2xl font-bold text-header-text">$12,450</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% vs last month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Invoices Sent
                </p>
                <p className="text-2xl font-bold text-header-text">26</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-primary mr-1" />
              <span className="text-sm text-primary">+3 this week</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Average Invoice
                </p>
                <p className="text-2xl font-bold text-header-text">$2,075</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-5% vs last month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-sm font-medium">
                  Collection Rate
                </p>
                <p className="text-2xl font-bold text-header-text">94%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+2% vs last month</span>
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
                {revenueData.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                      style={{
                        height: `${(data.amount / maxRevenue) * 100}%`,
                        minHeight: "20px",
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${data.amount.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-sm text-secondary-text mt-2">
                      {data.month}
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
                  {pieSlices.map((slice, index) => {
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
                        key={index}
                        d={pathData}
                        fill={slice.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="absolute -right-32 top-0 space-y-2">
                  {pieSlices.map((slice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      ></div>
                      <span className="text-sm text-primary-text">
                        {slice.status} ({slice.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-header-text mb-6">
              Monthly Breakdown
            </h2>
            <div className="space-y-4">
              {[
                {
                  month: "January 2024",
                  revenue: "$4,250",
                  invoices: 8,
                  growth: "+15%",
                },
                {
                  month: "December 2023",
                  revenue: "$3,800",
                  invoices: 6,
                  growth: "+8%",
                },
                {
                  month: "November 2023",
                  revenue: "$3,200",
                  invoices: 5,
                  growth: "-3%",
                },
                {
                  month: "October 2023",
                  revenue: "$3,400",
                  invoices: 7,
                  growth: "+12%",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-primary-text">
                      {item.month}
                    </p>
                    <p className="text-sm text-secondary-text">
                      {item.invoices} invoices
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-header-text">
                      {item.revenue}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        item.growth.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-header-text mb-6">
              Top Clients by Revenue
            </h2>
            <div className="space-y-4">
              {[
                { name: "Acme Corp", revenue: "$8,500", percentage: 68 },
                { name: "Design Studio", revenue: "$6,800", percentage: 55 },
                {
                  name: "Tech Solutions",
                  revenue: "$4,200",
                  percentage: 34,
                },
                { name: "Marketing Plus", revenue: "$950", percentage: 8 },
              ].map((client, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary-text">
                      {client.name}
                    </span>
                    <span className="font-semibold text-header-text">
                      {client.revenue}
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${client.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
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
                  {((item.count / totalInvoices) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 mt-8">
          <h2 className="text-xl font-semibold text-header-text mb-6">
            Performance Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#10B981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${94 * 1.88} ${188}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-header-text">
                    94%
                  </span>
                </div>
              </div>
              <p className="text-sm text-secondary-text">
                Payment Success Rate
              </p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${78 * 1.88} ${188}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-header-text">
                    78%
                  </span>
                </div>
              </div>
              <p className="text-sm text-secondary-text">Client Retention</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${86 * 1.88} ${188}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-header-text">
                    86%
                  </span>
                </div>
              </div>
              <p className="text-sm text-secondary-text">On-time Delivery</p>
            </div>
          </div>
        </div>
        <PlanWatcher initialPlan={userPlan} />
      </div>
    </div>
  );
}
