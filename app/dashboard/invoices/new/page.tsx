import InvoiceForm from "@/components/Invoices/InvoiceForm";
import Bounded from "@/components/ui/BoundedSection";
import {
  getBusinessById,
  getUserBusinesses,
} from "@/lib/actions/business.actions";
import { getClient, getClients } from "@/lib/actions/client.actions";
import { ClientType, NewInvoicePageProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import { getCurrentPlan } from "@/lib/plan";
import { AppPlan } from "@/lib/utils";

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

  const [business, clients, allBusinesses, userPlan] = await Promise.all([
    getBusinessById(Number(businessId)),
    getClients({ business_id: Number(businessId) }),
    getUserBusinesses(),
    getCurrentPlan(),
  ]);

  if (!business) return notFound();

  return (
    <DashboardShell
      business={business}
      allBusinesses={allBusinesses}
      activePage="invoices"
      userPlan={userPlan as AppPlan}
    >
      <div className="relative w-full z-10">
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
            {business.logo ? (
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
                <Image
                  src={business.logo}
                  alt="Business Logo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-md">
                {business.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                New Invoice
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Create a new invoice for {business.name}
              </p>
            </div>
          </div>
        </div>

        <InvoiceForm
          company_data={business}
          clients={clients}
          client_data={clients.find((c) => c.id === Number(clientId))}
        />
      </div>
    </DashboardShell>
  );
}
