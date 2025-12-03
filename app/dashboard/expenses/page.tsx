import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Receipt,
  TrendingDown,
  Calendar,
  Filter,
  Plane,
  Utensils,
  Briefcase,
  Laptop,
  Wrench,
  Megaphone,
  Zap,
  Home,
  Shield,
  Users,
  Folder,
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
import {
  getExpenses,
  getExpenseStats,
  getExpenseCategories,
} from "@/lib/actions/expense.actions";
import { getCurrentPlan } from "@/lib/plan";
import type { SearchParams } from "@/types";
import type { AppPlan } from "@/lib/utils";
import PlanWatcher from "@/components/PlanWatcher";
import { ExpenseRow } from "@/components/Expenses/ExpenseRow";

export const revalidate = 0;

const categoryIcons: Record<string, any> = {
  travel: Plane,
  meals: Utensils,
  office: Briefcase,
  software: Laptop,
  equipment: Wrench,
  marketing: Megaphone,
  utilities: Zap,
  rent: Home,
  insurance: Shield,
  professional_services: Users,
  other: Folder,
};

const categoryColors: Record<string, string> = {
  travel: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  meals:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  office: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  software:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  equipment:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  marketing: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  utilities:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  rent: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  insurance: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  professional_services:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;
  if (!business_id) redirect("/dashboard");

  const bizId = Number(business_id);

  // Get date range for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [
    business,
    allBusinesses,
    userPlan,
    businessStats,
    expenses,
    expenseStats,
    categories,
  ] = await Promise.all([
    getBusiness({ business_id: bizId }),
    getUserBusinesses(),
    getCurrentPlan(),
    getBusinessStats({ business_id: bizId }),
    getExpenses(bizId, { limit: 50 }).catch(() => []),
    getExpenseStats(bizId, startOfMonth, endOfMonth).catch(() => ({
      totalExpenses: 0,
      billableExpenses: 0,
      taxDeductible: 0,
      byCategory: {},
      count: 0,
    })),
    getExpenseCategories().catch(() => []),
  ]);

  if (!business) redirect("/dashboard");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: business.currency || "GBP",
    }).format(amount);
  };

  const isPaidUser = userPlan !== "free_user";

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="expenses"
      userPlan={userPlan as AppPlan}
      pendingInvoicesCount={businessStats?.total_pending_invoices || 0}
    >
      {!isPaidUser ? (
        /* Upgrade Prompt for Free Users */
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/30">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Unlock Expense Tracking
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Track all your business expenses, categorize them, and see where
              your money is going. Perfect for tax time.
            </p>
            <div className="space-y-3 text-left mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Categorize expenses automatically</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Mark expenses as billable to clients</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Monthly expense reports & analytics</span>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/20 w-full">
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
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20 text-white">
                <Receipt className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Expenses
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Track your business spending
                </p>
              </div>
            </div>
            <Link href={`/dashboard/expenses/new?business_id=${business_id}`}>
              <Button className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
          </div>

          {/* Monthly Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(expenseStats.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-rose-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Billable
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(expenseStats.billableExpenses)}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tax Deductible
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(expenseStats.taxDeductible)}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Transactions
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {expenseStats.count}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(expenseStats.byCategory).length > 0 && (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-slate-800/50">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                By Category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(expenseStats.byCategory).map(
                  ([category, amount]) => {
                    const Icon = categoryIcons[category] || Folder;
                    const colorClass =
                      categoryColors[category] || categoryColors.other;
                    return (
                      <div
                        key={category}
                        className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
                            {category.replace("_", " ")}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(amount as number)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-200/50 dark:border-slate-800/50">
              <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No expenses tracked yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start tracking your business expenses to calculate profit and
                stay tax-ready
              </p>
              <Link href={`/dashboard/expenses/new?business_id=${business_id}`}>
                <Button className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Expense
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    business={business}
                    formatCurrency={formatCurrency}
                  />
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
