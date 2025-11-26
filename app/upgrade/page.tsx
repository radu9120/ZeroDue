import DashboardPricing from "@/components/pricing/DashboardPricing";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Plan & Billing
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your subscription and billing details
          </p>
        </div>

        <DashboardPricing />
      </div>
    </main>
  );
}
