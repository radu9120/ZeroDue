"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Eye,
  Download,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import getStatusBadge from "@/components/ui/getStatusBadge";
import {
  getInvoices,
  deleteInvoiceAction,
} from "@/lib/actions/invoice.actions";
import { toast } from "sonner";
import type { AppPlan } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceListProps {
  initialInvoices: any[];
  businessId: number;
  totalCount: number;
  searchQuery?: string;
  statusFilter?: string;
  sortOrder?: string;
  userPlan?: AppPlan;
}

export default function InvoiceList({
  initialInvoices,
  businessId,
  totalCount,
  searchQuery = "",
  statusFilter = "all",
  sortOrder = "desc",
  userPlan = "free_user",
}: InvoiceListProps) {
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialInvoices.length < totalCount);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    invoiceId: number | null;
    invoiceNumber: string;
  }>({ show: false, invoiceId: null, invoiceNumber: "" });

  const openDeleteModal = (invoiceId: number, invoiceNumber: string) => {
    setDeleteModal({ show: true, invoiceId, invoiceNumber });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, invoiceId: null, invoiceNumber: "" });
  };

  const handleDelete = async () => {
    if (!deleteModal.invoiceId || deletingId) return;

    const invoiceId = deleteModal.invoiceId;
    setDeletingId(invoiceId);
    closeDeleteModal();

    try {
      const result = await deleteInvoiceAction(invoiceId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice deleted successfully");
      setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
    } catch (error) {
      toast.error("Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getInvoices(businessId, {
        search: searchQuery,
        status: statusFilter,
        page: nextPage,
        limit: 6,
      });

      if (result && result.invoices) {
        const newInvoices = [...invoices, ...result.invoices];
        setInvoices(newInvoices);
        setPage(nextPage);

        if (newInvoices.length >= result.totalCount) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!invoices || invoices.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
            No invoices found
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first invoice to get started"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((invoice: any) => {
          // Parse bill_to safely
          let billTo = null;
          try {
            if (typeof invoice.bill_to === "string") {
              billTo = JSON.parse(invoice.bill_to);
            } else if (invoice.bill_to && typeof invoice.bill_to === "object") {
              billTo = invoice.bill_to;
            }
          } catch (error) {
            console.error("Error parsing bill_to:", error);
          }

          return (
            <Card
              key={invoice.id}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-slate-800/40 dark:to-slate-900/0 pointer-events-none" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                        {invoice.invoice_number}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {billTo?.name || "No client"}
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-transform group-hover:scale-105">
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Amount
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    £{(invoice.total || 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                      Due Date
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(invoice.due_date)}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                      Created
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(invoice.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/dashboard/invoices/success?business_id=${businessId}&invoice_id=${invoice.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="neutralOutline"
                      size="sm"
                      className="w-full border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/invoices/success?business_id=${businessId}&invoice_id=${invoice.id}&download=1`}
                    aria-label="Download invoice PDF"
                  >
                    <Button
                      variant="neutralOutline"
                      size="sm"
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="neutralOutline"
                    size="sm"
                    onClick={() =>
                      openDeleteModal(
                        invoice.id,
                        invoice.invoice_number || `#${invoice.id}`
                      )
                    }
                    disabled={deletingId === invoice.id}
                    className="border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800"
                  >
                    {deletingId === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="neutralOutline"
            className="min-w-[150px] border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Delete Invoice
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Are you sure you want to delete invoice{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {deleteModal.invoiceNumber}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={closeDeleteModal}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
