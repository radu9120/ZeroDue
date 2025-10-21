import { getClient } from "@/lib/actions/client.actions";
import { getBusinessById } from "@/lib/actions/business.actions";
import { SearchParams } from "@/types";
import { redirect } from "next/navigation";
import Bounded from "@/components/ui/bounded";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientForm } from "@/components/Clients/ClientForm";

export const revalidate = 0;

export default async function EditClientPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;
  const client_id = params.client_id as string | undefined;

  if (!business_id || !client_id) {
    redirect("/dashboard");
  }

  const [client, business] = await Promise.all([
    getClient({ client_id: Number(client_id) }),
    getBusinessById(Number(business_id)),
  ]);

  if (!client || !business) {
    redirect(`/dashboard/clients?business_id=${business_id}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 transition-colors">
      <Bounded>
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/dashboard/clients?business_id=${business_id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                Edit Client
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                Update client information for {client.name}
              </p>
            </div>

            <ClientForm
              business_id={Number(business_id)}
              defaultValues={{
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone || "",
                address: client.address || "",
                business_id: client.business_id,
              }}
              redirectAfterSubmit={`/dashboard/clients?business_id=${business_id}`}
              submitButtonText="Save Changes"
            />
          </div>
        </div>
      </Bounded>
    </main>
  );
}
