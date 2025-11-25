"use client";
import { AlertTriangle, PlusIcon, Crown } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader({
  userPlan,
  totalBusinesses,
}: {
  userPlan: "free_user" | "professional" | "enterprise";
  totalBusinesses: number;
}) {
  const isFreePlan = userPlan === "free_user";
  const isProPlan = userPlan === "professional";
  const isPaidPlan = !isFreePlan; // professional or enterprise

  // Company limits per plan
  const companyLimit = isFreePlan ? 1 : isProPlan ? 3 : Infinity;

  const reachedCompanyLimit = totalBusinesses >= companyLimit;
  const canCreateCompany = totalBusinesses < companyLimit;

  // Show "New Company" in header only when user still has capacity and there is at least one company shown
  const showNewCompanyButtonInHeader = canCreateCompany && totalBusinesses > 0;

  // Show upgrade only when on free and at limit (pro has own limit but typically upgrade beyond pro isn't specified here)
  const showUpgradeElements = isFreePlan && reachedCompanyLimit;

  const handleBusinessCreated = () => {
    // Refresh will be handled by the modal closing and re-rendering
    window.location.reload();
  };

  if (totalBusinesses === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 justify-between py-4 mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100 mb-1 sm:mb-2">
          Your Business Profiles
        </h1>
        <p className="text-secondary-text dark:text-slate-400">
          {totalBusinesses === 0
            ? "Get started by creating your first business profile."
            : "Select a profile to manage invoices, clients, and view analytics."}
        </p>
      </div>

      {/* Action buttons container: only show if there are existing businesses OR if on a paid plan (which might allow creating from zero via header) */}
      {(totalBusinesses > 0 || isPaidPlan) && (
        <div className="mt-3 flex w-full flex-col gap-3 sm:mt-0 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {showUpgradeElements && (
            <>
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Free plan limit reached – contact support for options
                </span>
              </div>
              <Link
                href="/upgrade"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white transition-all hover:from-primary/90 hover:to-accent/90 sm:w-auto"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade Plan</span>
              </Link>
            </>
          )}

          {/* Manage Plan for paid users */}
          {!showUpgradeElements && (
            <Link
              href="/upgrade"
              className="hidden w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white transition-all hover:from-primary/90 hover:to-accent/90 sm:flex sm:w-auto"
            >
              <Crown className="h-4 w-4" />
              <span>Manage Plan</span>
            </Link>
          )}

          {/* Show "New Company" button if conditions are met and upgrade elements are not shown (upgrade takes precedence) */}
          {showNewCompanyButtonInHeader && !showUpgradeElements && (
            <Link
              href="/dashboard/business/new"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Profile</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
