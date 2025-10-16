import React from "react";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentPlan } from "@/lib/plan";
import { redirect } from "next/navigation";
import { normalizePlan, type AppPlan } from "@/lib/utils";
import {
  getCurrentMonthInvoiceCountForBusiness,
  getInvoices,
} from "@/lib/actions/invoice.actions";
import { getBusiness } from "@/lib/actions/business.actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";
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

  if (!businessId) {
    redirect("/dashboard");
  }

  const [business, invoicesData, allInvoicesCount, monthCount] =
    await Promise.all([
      getBusiness({ business_id: parseInt(businessId) }),
      getInvoices(parseInt(businessId), {
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: 12,
      }),
      // Lightweight count-only fetch ignoring filters to decide plan gating
      getInvoices(parseInt(businessId), {
        search: "",
        status: "all",
        page: 1,
        limit: 1,
      }),
      getCurrentMonthInvoiceCountForBusiness(parseInt(businessId)),
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
  const proMonthlyInvoiceLimit = 10;
  const reachedProMonthlyLimit =
    isProPlan && (monthCount || 0) >= proMonthlyInvoiceLimit;

  // Calculate summary stats
  const stats = {
    total: totalCount || 0,
    paid: invoices?.filter((inv: any) => inv.status === "paid").length || 0,
    pending:
      invoices?.filter((inv: any) => inv.status === "pending").length || 0,
    overdue:
      invoices?.filter((inv: any) => inv.status === "overdue").length || 0,
    totalAmount:
      invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) ||
      0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="relative w-full min-h-screen bg-gray-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white z-0" />
      <div className="absolute top-20 right-10 md:right-40 w-64 md:w-96 h-64 md:h-96 rounded-full bg-blue-100/30 mix-blend-multiply blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Invoices
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                Manage and track all your invoices for {business.name}
              </p>
            </div>
          </div>
          <CustomButton
            label="Create Invoice"
            icon={Plus}
            variant="primary"
            href={`/dashboard/invoices/new?business_id=${businessId}`}
            disabled={
              (isFreePlan && totalInvoicesAll >= 1) || reachedProMonthlyLimit
            }
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Paid</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.paid}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    £{stats.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <form
              method="GET"
              className="flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <input type="hidden" name="business_id" value={businessId} />

              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-4 w-4" />
                  <Input
                    name="search"
                    placeholder="Search invoices..."
                    className="pl-10 h-11 border-gray-200 dark:border-slate-700 rounded-xl"
                    defaultValue={searchQuery}
                  />
                </div>

                <Select name="status" defaultValue={statusFilter}>
                  <SelectTrigger className="w-48 h-11 border-gray-200 dark:border-slate-700 rounded-xl">
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

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </Button>

                <Link
                  href={`/dashboard/invoices?business_id=${businessId}&sort=${
                    sortOrder === "desc" ? "asc" : "desc"
                  }&search=${searchQuery}&status=${statusFilter}`}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 px-4 border border-gray-200 dark:border-slate-700 rounded-xl"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort by Date ({sortOrder === "desc" ? "Newest" : "Oldest"})
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Invoices Grid */}
        {invoices && invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice: any) => {
              // Parse bill_to safely
              let billTo = null;
              try {
                if (typeof invoice.bill_to === "string") {
                  billTo = JSON.parse(invoice.bill_to);
                } else if (
                  invoice.bill_to &&
                  typeof invoice.bill_to === "object"
                ) {
                  billTo = invoice.bill_to;
                }
              } catch (error) {
                console.error("Error parsing bill_to:", error);
              }

              return (
                <Card
                  key={invoice.id}
                  className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-slate-100">
                            {invoice.invoice_number}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-500">
                            {billTo?.name || "No client"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        Amount:
                      </span>
                      <span className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        £{(invoice.total || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        Due Date:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {formatDate(invoice.due_date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        Created:
                      </span>
                      <span className="text-sm text-gray-500 dark:text-slate-500">
                        {formatDate(invoice.created_at)}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Link
                        href={`/dashboard/invoices/success?business_id=${businessId}&invoice_id=${invoice.id}`}
                        className="flex-1"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/invoices/success?business_id=${businessId}&invoice_id=${invoice.id}&download=1`}
                        aria-label="Download invoice PDF"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first invoice to get started"}
              </p>
              <Link href={`/dashboard/invoices/new?business_id=${businessId}`}>
                <CustomButton
                  label="Create Invoice"
                  icon={Plus}
                  variant="primary"
                />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/dashboard/invoices?business_id=${businessId}&page=${page}&search=${searchQuery}&status=${statusFilter}&sort=${sortOrder}`}
              >
                <Button
                  variant={currentPage === page ? "primary" : "ghost"}
                  size="sm"
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
      <PlanWatcher initialPlan={plan} />
    </main>
  );
}
