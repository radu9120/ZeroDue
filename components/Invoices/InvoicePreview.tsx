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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Invoice Preview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This is how your invoice will look
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            {/* Invoice Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {formData.company_details?.logo ? (
                    <img
                      src={formData.company_details.logo}
                      alt="Company Logo"
                      className="w-16 h-16 object-contain object-left rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      {formData.company_details?.name || "Your Company"}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formData.company_details?.email || "email@example.com"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formData.company_details?.address || "Address"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-2">
                    <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {formData.invoice_number || "INV0001"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    INVOICE
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Bill To
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formData.bill_to?.name || "Client Name"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formData.bill_to?.email || "client@example.com"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formData.bill_to?.address || "Client Address"}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Issue Date
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(formData.issue_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Due Date
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
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
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-right py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-right py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                        className="border-b border-gray-100 dark:border-slate-800 last:border-0"
                      >
                        <td className="py-3 text-sm text-slate-900 dark:text-white">
                          {item.description || "—"}
                        </td>
                        <td className="py-3 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {item.quantity || 0}
                        </td>
                        <td className="py-3 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 text-sm font-medium text-slate-900 dark:text-white text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  {(!formData.items ||
                    formData.items.filter((i) => i.description).length ===
                      0) && (
                    <tr>
                      <td
                        colSpan={4}
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
            <div className="p-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Subtotal
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {formatCurrency(formData.subtotal)}
                    </span>
                  </div>
                  {(formData.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Discount
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatCurrency(formData.discount)}
                      </span>
                    </div>
                  )}
                  {(formData.shipping ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Shipping
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {formatCurrency(formData.shipping)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatCurrency(formData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {formData.notes && (
              <div className="px-6 pb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {formData.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="neutralOutline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
