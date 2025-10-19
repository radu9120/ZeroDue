import InvoiceForm from "@/components/Invoices/InvoiceForm";
import Bounded from "@/components/ui/bounded";
import { getBusinessById } from "@/lib/actions/business.actions";
import { getClient, getClients } from "@/lib/actions/client.actions";
import { ClientType, NewInvoicePageProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewInvoice({
  searchParams,
}: NewInvoicePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  // Ensure searchParams is awaited if it's a Promise
  const params = await searchParams;
  const businessId = params.business_id;
  const clientId = params.client_id;
  // const clientId = searchParams.client_id

  if (!businessId) return notFound();

  const business = await getBusinessById(Number(businessId));
  if (!business) return notFound();

  // const client = clientId ? await getClient({client_id: Number(clientId)}) : null

  const clients: ClientType[] = await getClients({
    business_id: Number(businessId),
  });

  return (
    <main className="relative w-full min-h-[100vh]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white z-0" />
      <div className="absolute top-20 right-10 md:right-40 w-64 md:w-96 h-64 md:h-96 rounded-full bg-blue-100/40 mix-blend-multiply blur-3xl"></div>
      <div className="absolute bottom-20 left-10 md:left-40 w-48 md:w-72 h-48 md:h-72 rounded-full bg-cyan-100/30 mix-blend-multiply blur-3xl"></div>
      <Bounded className="relative w-full z-10">
        <div className="mb-6">
          <Link
            href={`/dashboard/invoices?business_id=${businessId}`}
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-3 md:gap-5">
            {business.logo && (
              <div className="w-16 h-12 md:w-20 md:h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                <Image
                  src={business.logo}
                  alt={`${business.name} logo`}
                  width={160}
                  height={96}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-header-text dark:text-slate-100">
                Create Invoice
              </h1>
              <p className="text-sm md:text-base text-secondary-text dark:text-slate-400 mt-1 truncate">
                {business.name}
                {business.email ? ` • ${business.email}` : ""}
              </p>
            </div>
          </div>
        </div>

        <article className="bg-white dark:bg-slate-800 rounded-xl mx-auto shadow-2xl max-w-4xl w-full p-4 md:p-6">
          <InvoiceForm company_data={business} clients={clients} />
        </article>
      </Bounded>
    </main>
  );
}
