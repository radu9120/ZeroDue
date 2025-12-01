import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  Trash2,
  Crown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import {
  getBusiness,
  getUserBusinesses,
  getBusinessStats,
} from "@/lib/actions/business.actions";
import { getEstimates } from "@/lib/actions/estimate.actions";
import { getCurrentPlan } from "@/lib/plan";
import type { SearchParams } from "@/types";
import type { AppPlan } from "@/lib/utils";
import PlanWatcher from "@/components/PlanWatcher";

export const revalidate = 0;

const statusConfig: Record<
  string,
  { color: string; icon: any; label: string }
> = {
  draft: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: FileText,
    label: "Draft",
  },
  sent: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Send,
    label: "Sent",
  },
  viewed: {
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Eye,
    label: "Viewed",
  },
  accepted: {
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle,
    label: "Accepted",
  },
  rejected: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    label: "Rejected",
  },
  expired: {
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
    label: "Expired",
  },
  converted: {
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: ArrowRight,
    label: "Converted",
  },
};

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;
  if (!business_id) redirect("/dashboard");

  const bizId = Number(business_id);
  const [business, allBusinesses, userPlan, businessStats, estimates] =
    await Promise.all([
      getBusiness({ business_id: bizId }),
      getUserBusinesses(),
      getCurrentPlan(),
      getBusinessStats({ business_id: bizId }),
      getEstimates(bizId).catch(() => []),
    ]);

  if (!business) redirect("/dashboard");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: business.currency || "GBP",
    }).format(amount);
  };

  const pendingValue = estimates
    .filter((e) => ["sent", "viewed"].includes(e.status))
    .reduce((sum, e) => sum + (e.total || 0), 0);

  const acceptedValue = estimates
    .filter((e) => e.status === "accepted")
    .reduce((sum, e) => sum + (e.total || 0), 0);

  const isPaidUser = userPlan !== "free_user";

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="estimates"
      userPlan={userPlan as AppPlan}
      pendingInvoicesCount={businessStats?.total_pending_invoices || 0}
    >
      {!isPaidUser ? (
        /* Upgrade Prompt for Free Users */
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Unlock Estimates & Quotes
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Create professional estimates and quotes for your clients. Convert
              accepted quotes directly into invoices with one click.
            </p>
            <div className="space-y-3 text-left mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>Professional quote templates</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>Convert quotes to invoices instantly</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>Track quote status and expiry</span>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-500/20 w-full">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 text-white">
                <FileText className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Estimates & Quotes
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Create quotes and convert them to invoices
                </p>
              </div>
            </div>
            <Link href={`/dashboard/estimates/new?business_id=${business_id}`}>
              <Button className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
                <Plus className="h-4 w-4 mr-2" />
                New Estimate
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Estimates
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {estimates.length}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pending Response
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {
                  estimates.filter((e) => ["sent", "viewed"].includes(e.status))
                    .length
                }
              </p>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pending Value
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(pendingValue)}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Accepted Value
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(acceptedValue)}
              </p>
            </div>
          </div>

          {/* Estimates List */}
          {estimates.length === 0 ? (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-200/50 dark:border-slate-800/50">
              <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No estimates yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Create quotes for potential projects and convert them to
                invoices when accepted
              </p>
              <Link
                href={`/dashboard/estimates/new?business_id=${business_id}`}
              >
                <Button className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Estimate
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-800/50 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div>Estimate</div>
                <div>Client</div>
                <div>Amount</div>
                <div>Valid Until</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {estimates.map((estimate) => {
                  const status =
                    statusConfig[estimate.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  const isExpired =
                    estimate.valid_until &&
                    new Date(estimate.valid_until) < new Date();

                  return (
                    <div
                      key={estimate.id}
                      className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 md:px-6 md:py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors items-center"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {estimate.estimate_number}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 md:hidden">
                          {(estimate.client as any)?.name}
                        </p>
                      </div>
                      <div className="hidden md:block text-slate-700 dark:text-slate-300">
                        {(estimate.client as any)?.name || "Unknown"}
                      </div>
                      <div className="text-right md:text-left">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(estimate.total)}
                        </p>
                      </div>
                      <div className="hidden md:block text-slate-500 dark:text-slate-400 text-sm">
                        {estimate.valid_until
                          ? new Date(estimate.valid_until).toLocaleDateString()
                          : "No expiry"}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {isExpired && estimate.status !== "expired"
                            ? "Expired"
                            : status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {estimate.status === "accepted" &&
                          !estimate.converted_to_invoice_id && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Convert
                            </Button>
                          )}
                        <Link
                          href={`/dashboard/estimates/${estimate.id}?business_id=${business_id}`}
                        >
                          <Button variant="neutralOutline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="neutralOutline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <PlanWatcher initialPlan={userPlan as AppPlan} />
    </DashboardShell>
  );
}
