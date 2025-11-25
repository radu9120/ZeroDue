"use client";
import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Users, FileText, DollarSign, PlusIcon } from "lucide-react";
import ClientCard from "@/components/Clients/ClientCard";
import { ClientType } from "@/types";
import CustomButton from "../ui/CustomButton";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { normalizeCurrencyCode } from "@/lib/utils";

// Actually, I'll just use a simple timeout inside the component since I can't install packages easily without user permission/context.
// Or better, I'll just implement the logic directly.

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  const currencyCode = normalizeCurrencyCode(
    currency && typeof currency === "string" ? currency : "USD"
  );

  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

export default function ClientManagement({
  clients,
  business_id,
}: {
  clients: ClientType[];
  business_id: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = React.useState(
    searchParams.get("searchTerm") || ""
  );

  // Debounced search handler
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchValue) {
        params.set("searchTerm", searchValue);
      } else {
        params.delete("searchTerm");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, pathname, router, searchParams]);

  const handleSearch = (term: string) => {
    setSearchValue(term);
  };

  const stats = React.useMemo(() => {
    if (!clients || clients.length === 0) {
      return {
        totalInvoices: 0,
        activeClients: 0,
        totalRevenue: 0,
        representativeCurrency: "USD",
      };
    }

    let totalInvoices = 0;
    let activeClients = 0;
    let totalRevenue = 0;
    let representativeCurrency: string | undefined;

    for (const client of clients) {
      const invoiceCount = client.invoice_count ?? 0;
      if (invoiceCount > 0) {
        activeClients += 1;
      }
      totalInvoices += invoiceCount;

      const amount = client.invoice_total ?? 0;
      if (!Number.isNaN(amount)) {
        totalRevenue += amount;
      }

      if (!representativeCurrency && client.invoice_currency) {
        representativeCurrency = normalizeCurrencyCode(client.invoice_currency);
      }
    }

    return {
      totalInvoices,
      activeClients,
      totalRevenue,
      representativeCurrency: normalizeCurrencyCode(
        representativeCurrency || "USD"
      ),
    };
  }, [clients]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 text-white">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
              Client Management
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              Manage your clients and their information.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text dark:text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border-blue-200 focus:ring-primary w-full sm:w-64"
            />
          </div>
        </div>
        <CustomButton
          label="Add Client"
          icon={PlusIcon}
          variant="primary"
          onClick={() =>
            router.push(`/dashboard/clients/new?business_id=${business_id}`)
          }
        />
      </div>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No clients yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
            Start by adding your first client. Clients help you organize
            invoices and track payments.
          </p>
          <CustomButton
            label="Add Your First Client"
            icon={PlusIcon}
            variant="primary"
            onClick={() =>
              router.push(`/dashboard/clients/new?business_id=${business_id}`)
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard client={client} key={client.id} />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent dark:from-purple-500/10 pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20 text-white">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {clients.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Clients
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20 text-white">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.activeClients}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Active Clients
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalInvoices}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Invoices
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-xl p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10 pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(stats.totalRevenue, stats.representativeCurrency)}
            </p>{" "}
            {/* Replace with actual revenue calculation */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
