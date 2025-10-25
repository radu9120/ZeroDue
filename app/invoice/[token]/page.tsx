import { createSupabaseAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import InvoiceSuccessView from "@/components/Invoices/InvoiceSuccessView";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabaseAdmin = createSupabaseAdminClient();

  // Fetch invoice by public token
  const { data: invoice, error } = await supabaseAdmin
    .from("Invoices")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !invoice) {
    notFound();
  }

  // Fetch business details
  const { data: business } = await supabaseAdmin
    .from("Businesses")
    .select("*")
    .eq("id", invoice.business_id)
    .single();

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Invoice from <strong>{business.name}</strong>
          </p>
        </div>
        <InvoiceSuccessView
          invoice={invoice}
          company={business}
          editMode={false}
          userPlan="free"
          publicView
        />
      </div>
    </div>
  );
}
