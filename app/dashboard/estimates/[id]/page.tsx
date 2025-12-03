import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EstimateView } from "@/components/Estimates";
import { getEstimate } from "@/lib/actions/estimate.actions";
import { notFound } from "next/navigation";

interface EstimateDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ business_id?: string }>;
}

export default async function EstimateDetailPage({
  params,
  searchParams,
}: EstimateDetailPageProps) {
  const { id } = await params;
  const { business_id: businessId } = await searchParams;

  let estimate;
  try {
    estimate = await getEstimate(parseInt(id, 10));
  } catch {
    notFound();
  }

  if (!estimate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/dashboard/estimates?business_id=${businessId || ""}`}>
            <Button
              variant="ghost"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Estimates
            </Button>
          </Link>
        </div>
      </div>

      {/* Estimate View */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
          <EstimateView estimate={estimate} />
        </div>
      </div>
    </div>
  );
}
