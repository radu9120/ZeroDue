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
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-header-text dark:text-slate-100">
              {client.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-secondary-text dark:text-slate-400" />
          <span className="text-sm text-primary-text dark:text-slate-300">
            {client.email}
          </span>
        </div>
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-secondary-text dark:text-slate-400" />
            <span className="text-sm text-primary-text dark:text-slate-300">
              {client.phone}
            </span>
          </div>
        )}
        {client.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-secondary-text dark:text-slate-400 mt-0.5" />
            <span className="text-sm text-primary-text dark:text-slate-300">
              {client.address}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText className="h-4 w-4 text-primary dark:text-blue-400" />
            <span className="text-sm font-medium text-secondary-text dark:text-slate-300">
              Invoices
            </span>
          </div>
          <span className="text-lg font-bold text-header-text dark:text-slate-100">
            {client.invoice_count || 0}
          </span>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-secondary-text dark:text-slate-300">
              Total
            </span>
          </div>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
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
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
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
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Invoice
        </button>
      </div>
    </div>
  );
}
