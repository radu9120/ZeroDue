"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="col-span-3 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-slate-900 dark:text-white">
          Recent Invoices
        </CardTitle>
        <MoreHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {invoices.slice(0, 5).map((invoice) => {
            const clientName = getClientName(invoice);
            const clientEmail = getClientEmail(invoice);

            return (
              <Link
                href={`/dashboard/invoices/success?business_id=${invoice.business_id}&invoice_id=${invoice.id}`}
                key={invoice.id}
                className="flex items-center justify-between group cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${clientName}`}
                      alt={clientName}
                    />
                    <AvatarFallback className="bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                      {clientName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {clientName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {invoice.issue_date
                        ? format(new Date(invoice.issue_date), "MMM dd, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {currencySymbol}
                    {Number(invoice.total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      invoice.status === "paid"
                        ? "text-green-500"
                        : invoice.status === "pending"
                          ? "text-yellow-500"
                          : invoice.status === "overdue"
                            ? "text-red-500"
                            : "text-slate-500"
                    )}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </p>
                </div>
              </Link>
            );
          })}
          {invoices.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">
              No recent invoices
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-800">
          <Link
            href={`/dashboard/invoices?business_id=${invoices[0]?.business_id}`}
            className="text-sm text-blue-500 hover:text-blue-400 font-medium w-full text-center block"
          >
            View All Invoices
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
