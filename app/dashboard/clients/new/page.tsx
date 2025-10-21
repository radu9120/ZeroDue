import { getBusinessById } from "@/lib/actions/business.actions";
import { SearchParams } from "@/types";
import { redirect } from "next/navigation";
import Bounded from "@/components/ui/bounded";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientForm } from "@/components/Clients/ClientForm";

export const revalidate = 0;

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const business_id = params.business_id;

  if (!business_id) {
    redirect("/dashboard");
  }

  const business = await getBusinessById(Number(business_id));

  if (!business) {
    redirect("/dashboard");
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
                Add New Client
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                Create a new client for {business.name}
              </p>
            </div>

            <ClientForm
              business_id={Number(business_id)}
              redirectAfterSubmit={`/dashboard/clients?business_id=${business_id}`}
              submitButtonText="Add Client"
            />
          </div>
        </div>
      </Bounded>
    </main>
  );
}
