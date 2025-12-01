import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Calendar,
  Pause,
  Play,
  Trash2,
  FileText,
  Clock,
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
import { getRecurringInvoices } from "@/lib/actions/recurring.actions";
import { getCurrentPlan } from "@/lib/plan";
import type { SearchParams } from "@/types";
import type { AppPlan } from "@/lib/utils";
import PlanWatcher from "@/components/PlanWatcher";

export const revalidate = 0;

const frequencyLabels: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const statusColors: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  paused:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;
  if (!business_id) redirect("/dashboard");

  const bizId = Number(business_id);
  const [business, allBusinesses, userPlan, businessStats, recurringInvoices] =
    await Promise.all([
      getBusiness({ business_id: bizId }),
      getUserBusinesses(),
      getCurrentPlan(),
      getBusinessStats({ business_id: bizId }),
      getRecurringInvoices(bizId).catch(() => []),
    ]);

  if (!business) redirect("/dashboard");

  const isPaidUser = userPlan !== "free_user";

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="recurring"
      userPlan={userPlan as AppPlan}
      pendingInvoicesCount={businessStats?.total_pending_invoices || 0}
    >
      {!isPaidUser ? (
        /* Upgrade Prompt for Free Users */
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Unlock Recurring Invoices
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Automate your billing with recurring invoices. Set up once and let
              the system generate invoices automatically on your schedule.
            </p>
            <div className="space-y-3 text-left mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span>Weekly, monthly, or custom schedules</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span>Auto-send invoices to clients</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span>Pause or cancel anytime</span>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 w-full">
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
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 text-white">
                <RefreshCw className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Recurring Invoices
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Automate your regular billing
                </p>
              </div>
            </div>
            <Link href={`/dashboard/invoices/new?business_id=${business_id}`}>
              <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/20">
                <Plus className="h-4 w-4 mr-2" />
                New Recurring Invoice
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Active
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {
                      recurringInvoices.filter((r) => r.status === "active")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Pause className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Paused
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {
                      recurringInvoices.filter((r) => r.status === "paused")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Generated
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {recurringInvoices.reduce(
                      (sum, r) => sum + (r.invoices_generated || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Invoices List */}
          {recurringInvoices.length === 0 ? (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-200/50 dark:border-slate-800/50">
              <RefreshCw className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No recurring invoices yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Set up automatic invoicing for retainers, subscriptions, or
                regular services
              </p>
              <Link href={`/dashboard/invoices/new?business_id=${business_id}`}>
                <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Recurring Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {recurringInvoices.map((recurring) => (
                  <div
                    key={recurring.id}
                    className="p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <RefreshCw className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {(recurring.client as any)?.name ||
                                "Unknown Client"}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[recurring.status]}`}
                            >
                              {recurring.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {recurring.description || "Recurring Invoice"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {frequencyLabels[recurring.frequency]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Next:{" "}
                              {new Date(
                                recurring.next_invoice_date
                              ).toLocaleDateString()}
                            </span>
                            <span>
                              {recurring.invoices_generated} generated
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <Button
                          variant="neutralOutline"
                          size="sm"
                          className="text-slate-600 dark:text-slate-400"
                        >
                          {recurring.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </>
                          )}
                        </Button>
                        <Button
                          variant="neutralOutline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <PlanWatcher initialPlan={userPlan as AppPlan} />
    </DashboardShell>
  );
}
