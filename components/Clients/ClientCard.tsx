"use client";
import {
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  PlusIcon,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { normalizeCurrencyCode } from "@/lib/utils";

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  const currencyCode = normalizeCurrencyCode(
    currency && typeof currency === "string" ? currency : "USD"
  );

  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(0);
    } catch {
      return `${currencyCode} 0.00`;
    }
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export default function ClientCard({ client }: { client: any }) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-slate-800/40 dark:to-slate-900/0 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {client.name}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {client.email}
            </span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {client.phone}
              </span>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {client.address}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Invoices
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {client.invoice_count || 0}
            </span>
          </div>
          <div className="text-center p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(client.invoice_total, client.invoice_currency)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(
                `/dashboard/clients/edit?business_id=${client.business_id}&client_id=${client.id}`
              )
            }
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors text-sm"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() =>
              router.push(
                `/dashboard/invoices/new?business_id=${client.business_id}&client_id=${client.id}`
              )
            }
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors text-sm shadow-lg shadow-blue-500/20"
          >
            <PlusIcon className="h-4 w-4" />
            Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
