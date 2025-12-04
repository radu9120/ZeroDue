import * as React from "react";
import type { InvoiceListItem } from "@/types";
import type { InvoiceItemRow } from "./types";
import { normalizeCurrencyCode } from "@/lib/utils";

interface InvoiceSummarySectionProps {
  isEditing: boolean;
  canEditFullInvoice: boolean;
  itemRows: InvoiceItemRow[];
  shipping: number;
  onShippingChange: (value: number) => void;
  discount: number;
  onDiscountChange: (value: number) => void;
  currency: string;
  invoice: InvoiceListItem;
  getCurrencySymbol: (code?: string) => string;
  isCompactLayout: boolean;
}

export function InvoiceSummarySection({
  isEditing,
  canEditFullInvoice,
  itemRows,
  shipping,
  onShippingChange,
  discount,
  onDiscountChange,
  currency,
  invoice,
  getCurrencySymbol,
  isCompactLayout,
}: InvoiceSummarySectionProps) {
  const symbol =
    isEditing && canEditFullInvoice
      ? getCurrencySymbol(currency)
      : getCurrencySymbol(normalizeCurrencyCode(invoice.currency));
  const subtotal =
    isEditing && canEditFullInvoice
      ? itemRows.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : Number(invoice.subtotal || 0);
  const shippingValue =
    isEditing && canEditFullInvoice
      ? Number(shipping || 0)
      : Number(invoice.shipping || 0);
  const discountValue =
    isEditing && canEditFullInvoice
      ? Number(discount || 0)
      : Number(invoice.discount || 0);
  const total = subtotal + shippingValue - (subtotal * discountValue) / 100;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-700 px-5 py-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wide m-0">
          Invoice Summary
        </h4>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 p-5 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Subtotal
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {symbol}
            {subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Total
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {symbol}
            {(Number.isFinite(total) ? total : 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
