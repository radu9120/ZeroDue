import React from "react";
import { redirect } from "next/navigation";
import {
  getBusiness,
  getUserBusinesses,
  getBusinessStats,
} from "@/lib/actions/business.actions";
import { getCurrentPlan } from "@/lib/plan";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import Pricing from "@/components/pricing";
import { AppPlan } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    business_id?: string;
  }>;
}

export default async function PlanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const businessId = params.business_id;

  if (!businessId || isNaN(parseInt(businessId))) {
    redirect("/dashboard");
  }

  const parsedBusinessId = parseInt(businessId);

  const [business, allBusinesses, plan, businessStats] = await Promise.all([
    getBusiness({ business_id: parsedBusinessId }),
    getUserBusinesses(),
    getCurrentPlan(),
    getBusinessStats({ business_id: parsedBusinessId }),
  ]);

  if (!business) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="plan"
      userPlan={plan as AppPlan}
      pendingInvoicesCount={businessStats?.total_pending_invoices || 0}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Plan & Billing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage your subscription and billing details
          </p>
        </div>

        <Pricing showTitle={false} showBackground={false} />
      </div>
    </DashboardShell>
  );
}
