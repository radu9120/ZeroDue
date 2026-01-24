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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden py-8 sm:py-12">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Invoice from {business.name}
          </h1>
          <div className="inline-flex items-center justify-center p-1.5 mb-4 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              IF
            </div>
            <span className="ml-3 mr-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              Secure invoice viewing
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 dark:opacity-40 transition duration-1000 group-hover:opacity-100" />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
            <InvoiceSuccessView
              invoice={invoice}
              company={business}
              editMode={false}
              userPlan="free"
              publicView
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            Powered by
            <a
              href="https://zerodue.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ZeroDue
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-xs">Simple, beautiful invoicing</span>
          </p>
        </div>
      </div>
    </div>
  );
}
