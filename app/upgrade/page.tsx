import Pricing from "@/components/pricing";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const { userId } = await auth();

  return (
    <main className="min-h-[60vh] py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-header-text">
            Upgrade your plan
          </h1>
          <p className="text-secondary-text mt-2">
            Choose the plan that fits your business. You can change or cancel
            anytime.
          </p>
        </div>
        <Pricing />
      </div>
    </main>
  );
}
