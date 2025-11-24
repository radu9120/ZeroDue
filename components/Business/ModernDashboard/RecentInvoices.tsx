"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { format } from "date-fns";

interface RecentInvoicesProps {
  invoices: any[];
  currencySymbol: string;
}

export function RecentInvoices({
  invoices,
  currencySymbol,
}: RecentInvoicesProps) {
  const getClientName = (invoice: any) => {
    if (invoice.client?.name) return invoice.client.name;
    if (invoice.bill_to) {
      try {
        const billTo =
          typeof invoice.bill_to === "string"
            ? JSON.parse(invoice.bill_to)
            : invoice.bill_to;
        return billTo.name || "Unknown Client";
      } catch (e) {
        return "Unknown Client";
      }
    }
    return "Unknown Client";
  };

  const getClientEmail = (invoice: any) => {
    if (invoice.client?.email) return invoice.client.email;
    if (invoice.bill_to) {
      try {
        const billTo =
          typeof invoice.bill_to === "string"
            ? JSON.parse(invoice.bill_to)
            : invoice.bill_to;
        return billTo.email || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  return (
    <Card className="col-span-full md:col-span-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-gray-200/60 dark:border-slate-800/60 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Recent Invoices
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.slice(0, 5).map((invoice) => {
            const clientName = getClientName(invoice);
            const clientEmail = getClientEmail(invoice);

            return (
              <Link
                href={`/dashboard/invoices/success?business_id=${invoice.business_id}&invoice_id=${invoice.id}`}
                key={invoice.id}
                className="flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-slate-800/80 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 hover:shadow-sm"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-500/10 transition-all">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${clientName}`}
                      alt={clientName}
                    />
                    <AvatarFallback className="bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {clientName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {clientName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                      {invoice.issue_date
                        ? format(new Date(invoice.issue_date), "MMM dd, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right pl-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {currencySymbol}
                    {Number(invoice.total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex justify-end mt-1">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
                        invoice.status === "paid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : invoice.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            : invoice.status === "overdue"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {invoices.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No recent invoices found
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <Link
            href={`/dashboard/invoices?business_id=${invoices[0]?.business_id}`}
            className="flex items-center justify-center text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg"
          >
            View All Invoices
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
