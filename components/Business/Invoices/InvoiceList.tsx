"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/ui/CustomButton";
import Link from "next/link";
import { FileText, Plus, Eye, Download, Loader2 } from "lucide-react";
import getStatusBadge from "@/components/ui/getStatusBadge";
import { getInvoices } from "@/lib/actions/invoice.actions";

interface InvoiceListProps {
  initialInvoices: any[];
  businessId: number;
  totalCount: number;
  searchQuery?: string;
  statusFilter?: string;
  sortOrder?: string;
}

export default function InvoiceList({
  initialInvoices,
  businessId,
  totalCount,
  searchQuery = "",
  statusFilter = "all",
  sortOrder = "desc",
}: InvoiceListProps) {
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialInvoices.length < totalCount);

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
          <Link href={`/dashboard/invoices/new?business_id=${businessId}`}>
            <CustomButton
              label="Create Invoice"
              icon={Plus}
              variant="primary"
            />
          </Link>
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
              className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-slate-100">
                        {invoice.invoice_number}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        {billTo?.name || "No client"}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    Amount:
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    £{(invoice.total || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    Due Date:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {formatDate(invoice.due_date)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    Created:
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">
                    {formatDate(invoice.created_at)}
                  </span>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <Link
                    href={`/dashboard/invoices/success?business_id=${businessId}&invoice_id=${invoice.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </Link>
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
    </div>
  );
}
