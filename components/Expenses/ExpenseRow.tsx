"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Trash2,
  Download,
  Loader2,
  Plane,
  Utensils,
  Briefcase,
  Laptop,
  Wrench,
  Megaphone,
  Zap,
  Home,
  Shield,
  Users,
  Folder,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseReceipt } from "./ExpenseReceipt";
import { generateExpenseReceiptPDF } from "@/lib/expense-pdf";
import { deleteExpense } from "@/lib/actions/expense.actions";
import { toast } from "sonner";
import type { Expense, BusinessType } from "@/types";

const categoryIcons: Record<string, any> = {
  travel: Plane,
  meals: Utensils,
  office: Briefcase,
  software: Laptop,
  equipment: Wrench,
  marketing: Megaphone,
  utilities: Zap,
  rent: Home,
  insurance: Shield,
  professional_services: Users,
  other: Folder,
};

const categoryColors: Record<string, string> = {
  travel: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  meals:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  office: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  software:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  equipment:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  marketing: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  utilities:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  rent: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  insurance: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  professional_services:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

type PartialBusiness = Pick<
  BusinessType,
  "id" | "name" | "email" | "currency" | "logo" | "address" | "phone" | "vat"
>;

interface ExpenseRowProps {
  expense: Expense;
  business: PartialBusiness;
}

export function ExpenseRow({ expense, business }: ExpenseRowProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: business.currency || "GBP",
    }).format(amount);
  };

  const Icon = categoryIcons[expense.category] || Folder;
  const colorClass = categoryColors[expense.category] || categoryColors.other;

  const handleViewReceipt = () => {
    setShowReceiptModal(true);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await generateExpenseReceiptPDF(expense, business);
      toast.success("Expense receipt downloaded!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download expense receipt");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted");
    } catch (error) {
      toast.error("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {expense.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{expense.vendor || "No vendor"}</span>
              <span>•</span>
              <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
              {expense.is_billable && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Billable
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(expense.amount)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewReceipt}
            className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Receipt Modal - using portal to render at body level */}
      {showReceiptModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Expense Receipt
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutralOutline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="gap-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReceiptModal(false)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-800">
                <ExpenseReceipt expense={expense} business={business} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
