import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import {
  getBusinessById,
  getUserBusinesses,
} from "@/lib/actions/business.actions";
import { redirect } from "next/navigation";
import { UpdateBusiness } from "@/components/Business/Forms/UpdateBusiness";
import { getCurrentPlan } from "@/lib/plan";
import { AppPlan } from "@/lib/utils";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ business_id?: string }>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;

  if (!business_id) redirect("/dashboard");

  const [business, allBusinesses, userPlan] = await Promise.all([
    getBusinessById(parseInt(business_id)),
    getUserBusinesses(),
    getCurrentPlan(),
  ]);

  if (!business) redirect("/dashboard");

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="settings"
      userPlan={userPlan as AppPlan}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your business settings
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <UpdateBusiness businessId={business.id} initialBusiness={business} />
        </div>
      </div>
    </DashboardShell>
  );
}
