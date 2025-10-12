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
    <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Crown className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {userPlan === "free_user"
              ? "Free Plan Limitations Reached"
              : userPlan === "professional"
              ? "Professional Plan"
              : "Enterprise Plan"}
          </h3>
          <p className="text-yellow-700 mb-4">
            {userPlan === "free_user"
              ? "You're currently on the Free plan. Upgrade to unlock unlimited invoices and manage more companies."
              : userPlan === "professional"
              ? "Perfect for freelancers and small businesses — up to 3 companies and 10 invoices per month."
              : "You have unlimited access to all features."}
          </p>
          {userPlan !== "enterprise" && (
            <div className="flex items-center gap-6 mb-4">
              <div className="text-sm">
                <span className="font-medium">Companies: </span>
                <span
                  className={
                    (userPlan === "free_user" && companiesLengh >= 1) ||
                    (userPlan === "professional" && companiesLengh >= 3)
                      ? "text-red-600 font-semibold"
                      : ""
                  }
                >
                  {getCompanyLimitText()}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Total Invoices: </span>
                <span
                  className={
                    userPlan === "free_user" && totalInvoices >= 1
                      ? "text-red-600 font-semibold"
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
                <div className="text-sm">
                  <span className="font-medium">Invoices this month: </span>
                  <span
                    className={
                      monthlyInvoices >= 10 ? "text-red-600 font-semibold" : ""
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
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
          {(userPlan === "professional" || userPlan === "enterprise") && (
            <Button
              onClick={() => router.push("/upgrade")}
              className="bg-gradient-to-r from-primary to-accent text-white"
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
