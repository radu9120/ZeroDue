"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  History,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import { getPaymentHistory } from "@/lib/actions/payment.actions";
import type { InvoicePayment } from "@/types";

const paymentMethodIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  bank_transfer: Building2,
  cash: Banknote,
  other: Wallet,
};

interface PaymentHistoryProps {
  invoiceId: number;
  currency?: string;
  compact?: boolean;
}

export default function PaymentHistory({
  invoiceId,
  currency = "GBP",
  compact = false,
}: PaymentHistoryProps) {
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);

  const currencySymbol =
    currency === "GBP" ? "£" : currency === "USD" ? "$" : "€";

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPaymentHistory(invoiceId);
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No payments recorded yet</p>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => compact && setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 ${
          compact
            ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Payment History
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({payments.length} payment{payments.length !== 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-emerald-600">
            Total: {currencySymbol}
            {totalPaid.toFixed(2)}
          </span>
          {compact &&
            (expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ))}
        </div>
      </button>

      {/* Payment List */}
      {expanded && (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {payments.map((payment) => {
            const Icon = paymentMethodIcons[payment.payment_method] || Wallet;
            const paymentDate = new Date(
              payment.payment_date
            ).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {currencySymbol}
                      {payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {paymentDate}
                      {payment.reference_number && (
                        <span className="ml-2">
                          • Ref: {payment.reference_number}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      payment.payment_method === "card"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : payment.payment_method === "bank_transfer"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : payment.payment_method === "cash"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {payment.payment_method === "bank_transfer"
                      ? "Bank"
                      : payment.payment_method.charAt(0).toUpperCase() +
                        payment.payment_method.slice(1)}
                  </span>
                  {payment.notes && (
                    <p className="text-xs text-slate-400 mt-1 max-w-[150px] truncate">
                      {payment.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
