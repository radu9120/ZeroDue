import { EstimateView } from "@/components/Estimates";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function PublicEstimatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabaseAdmin = createSupabaseAdminClient();

  // Fetch estimate by public token
  const { data: estimate, error } = await supabaseAdmin
    .from("Estimates")
    .select(
      `
      *,
      client:Clients(*),
      business:Businesses(*)
    `
    )
    .eq("public_token", token)
    .single();

  if (error || !estimate) {
    notFound();
  }

  // Mark as viewed if sent
  if (estimate.status === "sent") {
    await supabaseAdmin
      .from("Estimates")
      .update({ status: "viewed" })
      .eq("id", estimate.id);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden py-8 sm:py-12">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-1.5 mb-4 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              IF
            </div>
            <span className="ml-3 mr-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              Estimate from <strong>{estimate.business?.name}</strong>
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl blur opacity-20 dark:opacity-40 transition duration-1000" />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
            <EstimateView estimate={estimate} publicView />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            Powered by
            <a
              href="https://invoiceflow.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              InvoiceFlow
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-xs">Simple, beautiful invoicing</span>
          </p>
        </div>
      </div>
    </div>
  );
}
