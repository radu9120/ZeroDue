"use client";

import { forwardRef } from "react";
import { format } from "date-fns";
import type { Expense, BusinessType } from "@/types";
import { getCurrencySymbol } from "@/lib/utils";

type PartialBusiness = Pick<
  BusinessType,
  "id" | "name" | "email" | "currency" | "logo" | "address" | "phone" | "vat"
>;

interface ExpenseReceiptProps {
  expense: Expense;
  business: PartialBusiness;
}

const categoryLabels: Record<string, string> = {
  travel: "Travel",
  meals: "Meals & Entertainment",
  office: "Office Supplies",
  software: "Software & Tools",
  equipment: "Equipment",
  marketing: "Marketing",
  utilities: "Utilities",
  rent: "Rent & Lease",
  insurance: "Insurance",
  professional_services: "Professional Services",
  other: "Other",
};

const paymentMethodLabels: Record<string, string> = {
  card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  paypal: "PayPal",
  check: "Cheque",
  other: "Other",
};

export const ExpenseReceipt = forwardRef<HTMLDivElement, ExpenseReceiptProps>(
  ({ expense, business }, ref) => {
    const currencySymbol = getCurrencySymbol(
      expense.currency || business.currency
    );

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: expense.currency || business.currency || "GBP",
      }).format(amount);
    };

    return (
      <div
        ref={ref}
        className="bg-white p-8 max-w-[800px] mx-auto"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Expense Receipt
            </h1>
            <p className="text-slate-500 text-sm">
              #{String(expense.id).padStart(6, "0")}
            </p>
          </div>
          <div className="text-right">
            {business.logo && (
              <img
                src={business.logo}
                alt={business.name}
                className="h-12 w-auto mb-2 ml-auto"
              />
            )}
            <h2 className="text-lg font-semibold text-slate-900">
              {business.name}
            </h2>
          </div>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Business Details
            </h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-medium">{business.name}</p>
              {business.address && <p>{business.address}</p>}
              {business.email && <p>{business.email}</p>}
              {business.phone && <p>{business.phone}</p>}
              {business.vat && <p>VAT: {business.vat}</p>}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Expense Date
            </h3>
            <p className="text-lg font-semibold text-slate-900">
              {format(new Date(expense.expense_date), "MMMM d, yyyy")}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Created: {format(new Date(expense.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Expense Details */}
        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-slate-900 font-medium">
                {expense.description}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Amount
              </h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </h4>
            <p className="text-sm font-medium text-slate-900">
              {categoryLabels[expense.category] || expense.category}
            </p>
          </div>
          {expense.vendor && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Vendor
              </h4>
              <p className="text-sm font-medium text-slate-900">
                {expense.vendor}
              </p>
            </div>
          )}
          {expense.payment_method && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Payment Method
              </h4>
              <p className="text-sm font-medium text-slate-900">
                {paymentMethodLabels[expense.payment_method] ||
                  expense.payment_method}
              </p>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </h4>
            <div className="flex flex-wrap gap-1">
              {expense.is_billable && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  Billable
                </span>
              )}
              {expense.is_tax_deductible && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Tax Deductible
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tax Info */}
        {(expense.tax_amount || expense.tax_rate) && (
          <div className="border border-slate-200 rounded-lg p-4 mb-6">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tax Information
            </h4>
            <div className="flex gap-6">
              {expense.tax_rate && (
                <div>
                  <span className="text-slate-500 text-sm">Tax Rate:</span>
                  <span className="ml-2 font-medium">{expense.tax_rate}%</span>
                </div>
              )}
              {expense.tax_amount && (
                <div>
                  <span className="text-slate-500 text-sm">Tax Amount:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(expense.tax_amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <div className="border-t border-slate-200 pt-6 mb-6">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Notes
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {expense.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 pt-6 mt-8">
          <p className="text-center text-xs text-slate-400">
            This expense receipt was generated by {business.name} using
            InvoiceFlow.
          </p>
        </div>
      </div>
    );
  }
);

ExpenseReceipt.displayName = "ExpenseReceipt";
