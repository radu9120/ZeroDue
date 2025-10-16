import Pricing from "@/components/pricing";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const { userId } = await auth();

  return (
    <main className="min-h-[60vh] pt-24 md:pt-28 py-12 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
            Upgrade your plan
          </h1>
          <p className="text-secondary-text dark:text-slate-400 mt-2">
            Choose the plan that fits your business. You can change or cancel
            anytime.
          </p>
        </div>
        <Pricing />
      </div>
    </main>
  );
}
