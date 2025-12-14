"use client";

import { useMemo } from "react";
import { X, FileText, Building2, User, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol, normalizeCurrencyCode } from "@/lib/utils";
import { format } from "date-fns";

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    invoice_number?: string;
    company_details?: {
      name?: string;
      email?: string;
      address?: string;
      phone?: string;
      logo?: string;
    };
    bill_to?: {
      name?: string;
      email?: string;
      address?: string;
    };
    issue_date?: Date;
    due_date?: Date;
    items?: Array<{
      description?: string;
      quantity?: number;
      unit_price?: number;
      tax?: number;
      amount?: number;
    }>;
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
    notes?: string;
    bank_details?: string;
    currency?: string;
    description?: string;
  };
}

export function InvoicePreview({
  isOpen,
  onClose,
  formData,
}: InvoicePreviewProps) {
  const currency = useMemo(
    () => normalizeCurrencyCode(formData.currency || "USD"),
    [formData.currency]
  );
  const currencySymbol = getCurrencySymbol(currency);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || isNaN(amount)) return `${currencySymbol}0.00`;
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "—";
    try {
      return format(date, "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Invoice Preview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This is how your client will see it
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 w-10 h-10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
            {/* Invoice Header with gradient */}
            <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex flex-col items-start gap-4">
                  {formData.company_details?.logo ? (
                    <img
                      src={formData.company_details.logo}
                      alt="Company Logo"
                      className="max-w-[180px] max-h-[80px] object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formData.company_details?.name || "Your Company"}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {formData.company_details?.email || "email@example.com"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formData.company_details?.address || "Address"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    INVOICE
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mt-3">
                    <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formData.invoice_number || "INV0001"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Bill To
                  </span>
                </div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">
                  {formData.bill_to?.name || "Client Name"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {formData.bill_to?.email || "client@example.com"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formData.bill_to?.address || "Client Address"}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Issue Date
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDate(formData.issue_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Due Date
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDate(formData.due_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {formData.description && (
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {formData.description}
                </p>
              </div>
            )}

            {/* Items Table */}
            <div className="p-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-600">
                    <th className="text-left py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-right py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-right py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="text-right py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || [])
                    .filter((item) => item.description)
                    .map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">
                          {item.description || "—"}
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {item.quantity || 0}
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {item.tax ? `${item.tax}%` : "—"}
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-900 dark:text-white text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  {(!formData.items ||
                    formData.items.filter((i) => i.description).length ===
                      0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400 dark:text-slate-500"
                      >
                        No items added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="flex justify-end">
                <div className="w-72 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Subtotal
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {formatCurrency(formData.subtotal)}
                    </span>
                  </div>
                  {(formData.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Discount
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        -{formatCurrency(formData.discount)}
                      </span>
                    </div>
                  )}
                  {(formData.shipping ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Shipping
                      </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {formatCurrency(formData.shipping)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-4 mt-2 border-t-2 border-slate-200 dark:border-slate-600">
                    <span className="text-slate-900 dark:text-white">
                      Total Due
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatCurrency(formData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Bank Details */}
            {(formData.notes || formData.bank_details) && (
              <div className="px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {formData.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                        Notes
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {formData.notes}
                      </p>
                    </div>
                  )}
                  {formData.bank_details && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800/30">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                        Bank Details
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {formData.bank_details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
          <Button variant="neutralOutline" onClick={onClose} className="px-6">
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
