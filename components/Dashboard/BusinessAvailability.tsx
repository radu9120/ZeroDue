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

  // Show banner for all plans; for Enterprise, we only show an info message (no counts/limits)

  const getCompanyLimitText = () => {
    if (userPlan === "free_user") {
      return `${companiesLengh}/1`;
    }
    if (userPlan === "professional") {
      return `${companiesLengh}/3`;
    }
    return `${companiesLengh}/∞`;
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
              ? "Free Plan Limitations Reached"
              : userPlan === "professional"
                ? "Professional Plan"
                : "Enterprise Plan"}
          </h3>
          <p className="text-yellow-700 dark:text-yellow-400">
            {userPlan === "free_user"
              ? "You're currently on the Free plan. Upgrade to unlock unlimited invoices and manage more companies."
              : userPlan === "professional"
                ? "Perfect for freelancers and small businesses — up to 3 companies and 10 invoices per month."
                : "You have unlimited access to all features."}
          </p>
          {userPlan !== "enterprise" && (
            <div className="flex flex-col items-start gap-3 text-sm text-yellow-800 dark:text-yellow-300 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <span className="font-medium">Companies: </span>
                <span
                  className={
                    (userPlan === "free_user" && companiesLengh >= 1) ||
                    (userPlan === "professional" && companiesLengh >= 3)
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }
                >
                  {getCompanyLimitText()}
                </span>
              </div>
              <div>
                <span className="font-medium">Total Invoices: </span>
                <span
                  className={
                    userPlan === "free_user" && totalInvoices >= 1
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }
                >
                  {totalInvoices}/
                  {userPlan === "free_user"
                    ? 1
                    : userPlan === "professional"
                      ? "∞"
                      : "∞"}
                </span>
              </div>
              {userPlan === "professional" && (
                <div>
                  <span className="font-medium">Invoices this month: </span>
                  <span
                    className={
                      monthlyInvoices >= 10
                        ? "text-red-600 dark:text-red-400 font-semibold"
                        : ""
                    }
                  >
                    {monthlyInvoices}/10
                  </span>
                </div>
              )}
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
              Manage Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
