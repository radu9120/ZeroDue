import React from "react";
import { cookies } from "next/headers";
import { currentUser } from "@/lib/auth";
import { getCurrentPlan } from "@/lib/plan";
import { redirect } from "next/navigation";
import { normalizePlan, type AppPlan } from "@/lib/utils";
import {
  getCurrentMonthInvoiceCountForUser,
  getInvoices,
} from "@/lib/actions/invoice.actions";
import {
  getBusiness,
  getUserBusinesses,
  getBusinessStats,
} from "@/lib/actions/business.actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Plus,
  DollarSign,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Download,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getStatusBadge from "@/components/ui/getStatusBadge";
import PlanWatcher from "../../../components/PlanWatcher";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import InvoiceList from "@/components/Business/Invoices/InvoiceList";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    business_id?: string;
    search?: string;
    status?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const businessId = params.business_id;
  const searchQuery = params.search || "";
  const statusFilter = params.status || "all";
  const currentPage = parseInt(params.page || "1");
  const sortOrder = params.sort || "desc";

  if (!businessId || isNaN(parseInt(businessId))) {
    redirect("/dashboard");
  }

  const parsedBusinessId = parseInt(businessId);

  const [
    business,
    invoicesData,
    allInvoicesCount,
    monthCount,
    allBusinesses,
    businessStats,
  ] = await Promise.all([
    getBusiness({ business_id: parsedBusinessId }),
    getInvoices(parsedBusinessId, {
      search: searchQuery,
      status: statusFilter,
      page: currentPage,
      limit: 6,
    }),
    // Lightweight count-only fetch ignoring filters to decide plan gating
    getInvoices(parsedBusinessId, {
      search: "",
      status: "all",
      page: 1,
      limit: 1,
    }),
    getCurrentMonthInvoiceCountForUser(),
    getUserBusinesses(),
    getBusinessStats({ business_id: parsedBusinessId }),
  ]);

  if (!business) {
    redirect("/dashboard");
  }

  const { invoices, totalCount, totalPages } = invoicesData;
  const totalInvoicesAll = allInvoicesCount?.totalCount || 0;
  const user = await currentUser();
  const plan: AppPlan = await getCurrentPlan();
  const isFreePlan = plan === "free_user";
  const isProPlan = plan === "professional";
  const proMonthlyInvoiceLimit = 15;
  const reachedProMonthlyLimit =
    isProPlan && (monthCount || 0) >= proMonthlyInvoiceLimit;

  // Calculate summary stats
  const stats = {
    total: businessStats?.total_invoices || totalCount || 0,
    paid: businessStats?.total_paid_invoices || 0,
    pending: businessStats?.total_pending_invoices || 0,
    overdue: businessStats?.total_overdue_invoices || 0,
    totalAmount: Number(businessStats?.total_paid_amount || 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="invoices"
      pendingInvoicesCount={stats.pending}
      userPlan={plan}
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 dark:bg-blue-900/40">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-200" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
                Invoices
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-slate-400">
                Manage and track all your invoices for {business.name}
              </p>
            </div>
          </div>
          <Link href={`/dashboard/invoices/new?business_id=${businessId}`}>
            <Button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white border-0"
              disabled={
                (isFreePlan && (monthCount || 0) >= 3) || reachedProMonthlyLimit
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Total
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Invoices
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.total}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                  <DollarSign className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  Paid
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Paid Invoices
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.paid}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  Pending
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Invoices
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.pending}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent dark:from-purple-500/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                  <DollarSign className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  Revenue
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Amount
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  £{stats.totalAmount.toFixed(2)}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-4 md:p-6">
            <form method="GET" className="flex flex-col gap-4">
              <input type="hidden" name="business_id" value={businessId} />

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 flex-1">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-4 w-4" />
                  <Input
                    name="search"
                    placeholder="Search invoices..."
                    className="pl-10 h-11 border-gray-200 dark:border-slate-700 rounded-xl w-full"
                    defaultValue={searchQuery}
                  />
                </div>

                <Select name="status" defaultValue={statusFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-11 border-gray-200 dark:border-slate-700 rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  type="submit"
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
                >
                  Apply Filters
                </Button>

                <Link
                  href={`/dashboard/invoices?business_id=${businessId}&sort=${
                    sortOrder === "desc" ? "asc" : "desc"
                  }&search=${searchQuery}&status=${statusFilter}`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 px-4 border border-gray-200 dark:border-slate-700 rounded-xl w-full"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      Sort by Date ({sortOrder === "desc" ? "Newest" : "Oldest"}
                      )
                    </span>
                    <span className="sm:hidden">
                      Sort ({sortOrder === "desc" ? "↓" : "↑"})
                    </span>
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <InvoiceList
          initialInvoices={invoices}
          businessId={parsedBusinessId}
          totalCount={totalCount || 0}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          sortOrder={sortOrder}
        />
      </div>
      <PlanWatcher initialPlan={plan} />
    </DashboardShell>
  );
}
