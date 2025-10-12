import ClientManagement from "@/components/Clients/ClientManagement";
import Bounded from "@/components/ui/bounded";
import { getAllClients } from "@/lib/actions/client.actions";
import { SearchParams } from "@/types";
import { redirect } from "next/navigation";
import PlanWatcher from "../../../components/PlanWatcher";
import { currentUser } from "@clerk/nextjs/server";
import { normalizePlan, type AppPlan } from "@/lib/utils";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>; // Make searchParams a Promise it was failing deployment because it was not awaited
}) {

  const filter = await searchParams; // Now this will work correctly
  const business_id = filter.business_id
  const searchTerm = filter.searchTerm || "";

  if (!business_id) redirect('/dashboard')

  const clients = await getAllClients({ business_id: business_id });
  const user = await currentUser();
  const metaPlanRaw = (user?.publicMetadata as any)?.plan;
  const userPlan: AppPlan = normalizePlan(metaPlanRaw || "free_user");

  return (
    <main>
      <Bounded className="">
        <ClientManagement clients={clients} business_id={business_id} />
      </Bounded>
      <PlanWatcher initialPlan={userPlan} />
    </main>
  );
}
