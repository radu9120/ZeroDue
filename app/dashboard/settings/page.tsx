import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { normalizePlan, type AppPlan } from "@/lib/utils";
import Bounded from "@/components/ui/bounded";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const metaPlanRaw = (user?.publicMetadata as any)?.plan;
  const userPlan: AppPlan = normalizePlan(metaPlanRaw || "free_user");

  return (
    <main>
      <Bounded>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
            Settings
          </h1>
          <p className="text-secondary-text dark:text-slate-400 mt-2">
            Manage your account, plan, and workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="border rounded-xl p-6 bg-white dark:bg-slate-800">
            <h2 className="text-lg font-semibold mb-2">Plan</h2>
            <p className="text-secondary-text dark:text-slate-400 mb-4">
              Current plan: <span className="font-medium">{userPlan}</span>
            </p>
            <div className="flex gap-3">
              <Link href="/upgrade">
                <Button className="bg-gradient-to-r from-primary to-accent text-white">
                  Manage billing
                </Button>
              </Link>
            </div>
          </section>

          <section className="border rounded-xl p-6 bg-white dark:bg-slate-800">
            <h2 className="text-lg font-semibold mb-2">Workspace</h2>
            <p className="text-secondary-text dark:text-slate-400 mb-4">
              Configure your businesses, clients, and invoices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/business">
                <Button variant="secondary">Business</Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button variant="secondary">Clients</Button>
              </Link>
              <Link href="/dashboard/invoices">
                <Button variant="secondary">Invoices</Button>
              </Link>
            </div>
          </section>
        </div>
      </Bounded>
    </main>
  );
}
