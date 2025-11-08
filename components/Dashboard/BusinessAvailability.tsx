"use client"; // Add this for useRouter
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter
import type { AppPlan } from "@/lib/utils";

interface PlanLimitationsProps {
  userPlan: AppPlan;
  companiesLengh: number;
  totalInvoices: number;
  monthlyInvoices?: number;
}

export default function BusinessAvailabilty({
  userPlan,
  companiesLengh,
  totalInvoices,
  monthlyInvoices = 0,
}: PlanLimitationsProps) {
  const router = useRouter(); // Initialize router

  const companyLimit =
    userPlan === "free_user" ? 1 : userPlan === "professional" ? 3 : Infinity;
  const monthlyInvoiceLimit =
    userPlan === "free_user" ? 2 : userPlan === "professional" ? 10 : Infinity;

  const reachedCompanyLimit =
    companyLimit !== Infinity && companiesLengh >= companyLimit;
  const reachedMonthlyLimit =
    monthlyInvoiceLimit !== Infinity && monthlyInvoices >= monthlyInvoiceLimit;

  const hasHitLimit = Boolean(reachedCompanyLimit || reachedMonthlyLimit);

  const getCompanyLimitText = () => {
    if (companyLimit === Infinity) {
      return `${companiesLengh}/∞`;
    }
    return `${companiesLengh}/${companyLimit}`;
  };

  const handleUpgradeClick = () => {
    router.push("/upgrade"); // Navigate to dedicated upgrade page
  };

  return (
    <div className="mt-12 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/50 dark:bg-yellow-900/20 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
          <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            {userPlan === "free_user"
              ? hasHitLimit
                ? "Free plan limits reached"
                : "You're on the Free plan"
              : userPlan === "professional"
                ? hasHitLimit
                  ? "Professional plan limits reached"
                  : "You're on the Professional plan"
                : "Enterprise plan overview"}
          </h3>
          <p className="text-yellow-700 dark:text-yellow-400">
            {userPlan === "free_user"
              ? hasHitLimit
                ? "You've hit the Free plan limits. Upgrade to unlock more invoices and manage more businesses."
                : "You're on the Free plan — 1 business profile, 2 invoices per month, unlimited clients."
              : userPlan === "professional"
                ? hasHitLimit
                  ? "You've reached the Professional plan limits. Upgrade to Enterprise for unlimited growth."
                  : "Perfect for growing teams — up to 3 business profiles and 10 invoices per month."
                : "You have unlimited access to all features."}
          </p>
          {userPlan !== "enterprise" && (
            <div className="flex flex-col items-start gap-3 text-sm text-yellow-800 dark:text-yellow-300 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <span className="font-medium">Companies: </span>
                <span
                  className={
                    reachedCompanyLimit
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }
                >
                  {getCompanyLimitText()}
                </span>
              </div>
              <div>
                <span className="font-medium">Invoices this month: </span>
                <span
                  className={
                    reachedMonthlyLimit
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }
                >
                  {monthlyInvoices}/
                  {monthlyInvoiceLimit === Infinity ? "∞" : monthlyInvoiceLimit}
                </span>
              </div>
            </div>
          )}
          {userPlan === "free_user" && (
            <Button
              onClick={handleUpgradeClick} // Add click handler
              className="w-full bg-gradient-to-r from-primary to-accent text-white sm:w-auto"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
          {(userPlan === "professional" || userPlan === "enterprise") && (
            <Button
              onClick={() => router.push("/upgrade")}
              className="w-full bg-gradient-to-r from-primary to-accent text-white sm:w-auto"
            >
              <Crown className="h-4 w-4 mr-2" />
              {hasHitLimit ? "Upgrade Plan" : "Manage Plan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
