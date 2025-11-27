"use client";
import { InvoiceListItem } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import CustomButton from "../ui/CustomButton";
import {
  Download,
  Eye,
  FileText,
  FilterIcon,
  MoreVertical,
  PlusIcon,
  SearchIcon,
  Edit,
  Trash2,
  Send,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import getStatusBadge from "../ui/getStatusBadge";
import { Button } from "../ui/button";
import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import CustomModal from "../ModalsForms/CustomModal";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import {
  EmailStatusPatch,
  buildEmailStatusBadges,
  mergeEmailStatusState,
  shouldStopStatusPolling,
  toEmailStatusState,
} from "@/lib/email-status";
import { getCurrencySymbol, normalizeCurrencyCode } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { deleteInvoiceAction } from "@/lib/actions/invoice.actions";
import { sendInvoiceEmailAction } from "@/lib/actions/email.actions";

const PAGE_SIZE = 5; // Keep in sync with getInvoicesList default limit

const formatInvoiceAmount = (value: unknown, currency?: string) => {
  const currencyCode = normalizeCurrencyCode(currency);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const toNumber = (raw: unknown) => {
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = Number(raw.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const amount = toNumber(value);

  if (amount === null) {
    return typeof value === "string" && value.trim().length > 0
      ? value
      : `${currencySymbol} ${value ?? ""}`.trim();
  }

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    console.warn("Currency formatting error", error);
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

const applyStatusPatchToInvoice = (
  invoice: InvoiceListItem,
  patch: EmailStatusPatch
): InvoiceListItem => {
  const merged = mergeEmailStatusState(toEmailStatusState(invoice), patch);

  return {
    ...invoice,
    status: merged.status ?? invoice.status,
    email_id: merged.email_id,
    email_sent_at: merged.email_sent_at,
    email_delivered: merged.email_delivered,
    email_delivered_at: merged.email_delivered_at,
    email_opened: merged.email_opened,
    email_opened_at: merged.email_opened_at,
    email_open_count: merged.email_open_count,
    email_clicked: merged.email_clicked,
    email_clicked_at: merged.email_clicked_at,
    email_click_count: merged.email_click_count,
    email_bounced: merged.email_bounced,
    email_bounced_at: merged.email_bounced_at,
    email_complained: merged.email_complained,
    email_complained_at: merged.email_complained_at,
  };
};

// Invoice Preview Component for Modal
function InvoicePreview({
  invoice,
  business_id,
  closeModal,
}: {
  invoice: InvoiceListItem;
  business_id: Number;
  closeModal?: () => void;
}) {
  // Parse items safely
  let items: any[] = [];
  try {
    if (Array.isArray(invoice.items)) {
      items = invoice.items;
    } else if (typeof invoice.items === "string") {
      items = JSON.parse(invoice.items);
    } else if (invoice.items && typeof invoice.items === "object") {
      items = Object.values(invoice.items);
    }
  } catch (error) {
    console.error("Error parsing items:", error);
    items = [];
  }

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
    billTo = null;
  }

  // Parse company_details safely
  let companyDetails = null;
  try {
    if (typeof invoice.company_details === "string") {
      companyDetails = JSON.parse(invoice.company_details);
    } else if (
      invoice.company_details &&
      typeof invoice.company_details === "object"
    ) {
      companyDetails = invoice.company_details;
    }
  } catch (error) {
    console.error("Error parsing company_details:", error);
    companyDetails = null;
  }

  const currencyCode = normalizeCurrencyCode(invoice.currency);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const isHourly =
    invoice.invoice_template === "hourly" ||
    invoice.invoice_template === "freelance";
  const qtyLabel = isHourly ? "Hours" : "Qty";
  const priceLabel = isHourly ? "Rate/Hr" : "Unit Price";

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Invoice Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b">
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-4">
            From
          </h3>
          {companyDetails ? (
            <div className="space-y-2">
              <div>
                <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Company:
                </span>
                <p className="text-header-text dark:text-slate-100 font-medium">
                  {companyDetails.name}
                </p>
              </div>
              <div>
                <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Email:
                </span>
                <p className="text-header-text dark:text-slate-100">
                  {companyDetails.email}
                </p>
              </div>
              {companyDetails.phone && (
                <div>
                  <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                    Phone:
                  </span>
                  <p className="text-header-text dark:text-slate-100">
                    {companyDetails.phone}
                  </p>
                </div>
              )}
              {companyDetails.address && (
                <div>
                  <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                    Address:
                  </span>
                  <p className="text-header-text dark:text-slate-100">
                    {companyDetails.address}
                  </p>
                </div>
              )}
              {companyDetails.vat && (
                <div>
                  <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                    VAT Number:
                  </span>
                  <p className="text-header-text dark:text-slate-100">
                    {companyDetails.vat}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-secondary-text dark:text-slate-400 bg-yellow-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              No company information available
            </div>
          )}
        </div>

        {/* Client Information */}
        <div>
          <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-4">
            Bill To
          </h3>
          {billTo ? (
            <div className="space-y-2">
              <div>
                <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Name:
                </span>
                <p className="text-header-text dark:text-slate-100 font-medium">
                  {billTo.name}
                </p>
              </div>
              <div>
                <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Email:
                </span>
                <p className="text-header-text dark:text-slate-100">
                  {billTo.email}
                </p>
              </div>
              {billTo.phone && (
                <div>
                  <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                    Phone:
                  </span>
                  <p className="text-header-text dark:text-slate-100">
                    {billTo.phone}
                  </p>
                </div>
              )}
              {billTo.address && (
                <div>
                  <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                    Address:
                  </span>
                  <p className="text-header-text dark:text-slate-100">
                    {billTo.address}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-secondary-text dark:text-slate-400 bg-yellow-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              No client information available
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-4">
            Invoice Details
          </h3>
          <div className="space-y-2">
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Invoice Number:
              </span>
              <p className="text-header-text dark:text-slate-100 font-bold">
                {invoice.invoice_number}
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Description:
              </span>
              <p className="text-header-text dark:text-slate-100">
                {invoice.description || "No description"}
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Issue Date:
              </span>
              <p className="text-header-text dark:text-slate-100">
                {invoice.issue_date
                  ? new Date(invoice.issue_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Due Date:
              </span>
              <p className="text-header-text dark:text-slate-100">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-4">
            Payment Details
          </h3>
          <div className="space-y-2">
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Status:
              </span>
              <div className="mt-1">{getStatusBadge(invoice.status)}</div>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Currency:
              </span>
              <p className="text-header-text dark:text-slate-100">
                {currencySymbol}
                {currencyCode ? ` (${currencyCode})` : ""}
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Subtotal:
              </span>
              <p className="text-header-text dark:text-slate-100">
                {formatInvoiceAmount(invoice.subtotal, invoice.currency)}
              </p>
            </div>
            {(invoice.discount ?? 0) > 0 && (
              <div>
                <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Discount:
                </span>
                <p className="text-header-text dark:text-slate-100">
                  {invoice.discount}%
                </p>
              </div>
            )}
            {(invoice.shipping ?? 0) > 0 && (
              <div>
                <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Shipping:
                </span>
                <p className="text-header-text dark:text-slate-100">
                  {formatInvoiceAmount(invoice.shipping, invoice.currency)}
                </p>
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Total Amount:
              </span>
              <p className="text-xl font-bold text-primary">
                {formatInvoiceAmount(invoice.total, invoice.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h3 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-4">
          Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 dark:border-slate-600 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-center font-semibold">
                  {qtyLabel}
                </th>
                <th className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-right font-semibold">
                  {priceLabel}
                </th>
                <th className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-center font-semibold">
                  Tax %
                </th>
                <th className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item: any, index: number) => {
                  const quantity = Number(item.quantity) || 0;
                  const unitPrice = Number(item.unit_price) || 0;
                  const tax = Number(item.tax) || 0;
                  const amount = Number(item.amount) || 0;

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:bg-slate-800"
                    >
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3">
                        {item.description || "No description"}
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-center">
                        {quantity}
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-right">
                        {formatInvoiceAmount(unitPrice, invoice.currency)}
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-center">
                        {tax}%
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-right font-medium">
                        {formatInvoiceAmount(amount, invoice.currency)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-300 dark:border-slate-600 px-4 py-8 text-center text-secondary-text dark:text-slate-400"
                  >
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes and Bank Details */}
      {(invoice.notes || invoice.bank_details) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t">
          {invoice.notes && (
            <div>
              <h4 className="text-md font-semibold text-header-text dark:text-slate-100 mb-2">
                Notes
              </h4>
              <p className="text-sm text-secondary-text dark:text-slate-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-md">
                {invoice.notes}
              </p>
            </div>
          )}
          {invoice.bank_details && (
            <div>
              <h4 className="text-md font-semibold text-header-text dark:text-slate-100 mb-2">
                Bank Details
              </h4>
              <p className="text-sm text-secondary-text dark:text-slate-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-md whitespace-pre-line">
                {invoice.bank_details}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Link
          href={`/dashboard/invoices/success?business_id=${business_id}&invoice_id=${invoice.id}&download=1`}
        >
          <Button className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </Link>
        <Button variant="secondary" onClick={closeModal}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  );
}

// Search and Filter Component (same as before)
function SearchAndFilter({
  onSearch,
  onFilterChange,
  searchTerm,
  currentFilter,
}: {
  onSearch: (term: string) => void;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  currentFilter: string;
}) {
  const [searchInput, setSearchInput] = useState(searchTerm);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-header-text dark:text-slate-100 mb-2">
            Search Invoices
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by invoice number..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-header-text dark:text-slate-100 mb-2">
            Filter by Status
          </label>
          <select
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </form>
    </div>
  );
}

export default function InvoiceTable({
  invoices,
  business_id,
  userPlan,
}: {
  invoices: InvoiceListItem[];
  business_id: Number;
  userPlan: "free_user" | "professional" | "enterprise";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSending, setIsSending] = useState<number | null>(null);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceListItem[]>(invoices);
  const currentPage = Number(searchParams.get("page") || "1");
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<InvoiceListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pollingMapRef = useRef(
    new Map<
      number,
      {
        timeoutId: ReturnType<typeof setTimeout> | null;
        startedAt: number;
        active: boolean;
      }
    >()
  );

  useEffect(() => {
    setInvoiceRows(invoices);
  }, [invoices]);

  const mergeInvoiceStatus = useCallback(
    (invoiceId: number, patch: EmailStatusPatch) => {
      if (!patch) return;

      setInvoiceRows((prev) =>
        prev.map((row) =>
          row.id === invoiceId ? applyStatusPatchToInvoice(row, patch) : row
        )
      );
    },
    []
  );

  const stopInvoicePolling = useCallback((invoiceId: number) => {
    const state = pollingMapRef.current.get(invoiceId);
    if (!state) return;

    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    pollingMapRef.current.delete(invoiceId);
  }, []);

  const fetchInvoiceStatus = useCallback(
    async (invoiceId: number) => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}/status`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status !== 404) {
            console.warn("Failed to refresh invoice status", res.statusText);
          }
          return null;
        }

        const payload = (await res.json()) as { invoice?: EmailStatusPatch };

        if (payload?.invoice) {
          mergeInvoiceStatus(invoiceId, payload.invoice);
          return payload.invoice;
        }
      } catch (error) {
        console.error("Error fetching invoice status:", error);
      }

      return null;
    },
    [mergeInvoiceStatus]
  );

  const startInvoicePolling = useCallback(
    (invoiceId: number) => {
      stopInvoicePolling(invoiceId);

      const state = {
        timeoutId: null as ReturnType<typeof setTimeout> | null,
        startedAt: Date.now(),
        active: true,
      };

      pollingMapRef.current.set(invoiceId, state);

      const poll = async () => {
        const current = pollingMapRef.current.get(invoiceId);
        if (!current || !current.active) return;

        const latest = await fetchInvoiceStatus(invoiceId);

        const stillActive = pollingMapRef.current.get(invoiceId);
        if (!stillActive || !stillActive.active) {
          return;
        }

        if (shouldStopStatusPolling(latest)) {
          stopInvoicePolling(invoiceId);
          return;
        }

        if (Date.now() - stillActive.startedAt >= 30000) {
          stopInvoicePolling(invoiceId);
          return;
        }

        stillActive.timeoutId = setTimeout(poll, 2000);
      };

      void poll();
    },
    [fetchInvoiceStatus, stopInvoicePolling]
  );

  useEffect(() => {
    return () => {
      pollingMapRef.current.forEach((state) => {
        if (state.timeoutId) {
          clearTimeout(state.timeoutId);
        }
      });
      pollingMapRef.current.clear();
    };
  }, []);

  const search = searchParams.get("searchTerm") || "";
  const filter = searchParams.get("filter") || "";

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("searchTerm", term);
    } else {
      params.delete("searchTerm");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (filterValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (filterValue) {
      params.set("filter", filterValue);
    } else {
      params.delete("filter");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  const handleSendToClient = async (invoice: InvoiceListItem) => {
    setIsSending(invoice.id);

    try {
      const data = await sendInvoiceEmailAction(
        invoice.id,
        Number(business_id)
      );

      toast.success(data.message || "Invoice sent successfully!");

      mergeInvoiceStatus(invoice.id, {
        status: (data.updatedStatus as string | null) || "sent",
        email_id: (data.emailId as string | null) ?? invoice.email_id,
        email_sent_at: new Date().toISOString(),
        email_delivered: null,
        email_delivered_at: null,
        email_opened: null,
        email_opened_at: null,
        email_open_count: 0,
        email_clicked: null,
        email_clicked_at: null,
        email_click_count: 0,
        email_bounced: null,
        email_bounced_at: null,
        email_complained: null,
        email_complained_at: null,
      });

      startInvoicePolling(invoice.id);
    } catch (error: any) {
      console.error("Error sending invoice:", error);
      toast.error(error.message || "Failed to send invoice to client");
    } finally {
      setIsSending(null);
    }
  };

  const handleDeleteInvoice = (invoice: InvoiceListItem) => {
    setInvoiceToDelete(invoice);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteInvoiceAction(invoiceToDelete.id);

      // Check if result is an error
      if (result && "error" in result) {
        toast.error(result.error);
        setInvoiceToDelete(null);
        return;
      }

      toast.success(`Invoice ${invoiceToDelete.invoice_number} deleted`);
      // Optimistic update
      setInvoiceRows((prev) =>
        prev.filter((invoice) => invoice.id !== invoiceToDelete.id)
      );
      setInvoiceToDelete(null);
    } catch (error) {
      console.error("Error deleting invoice", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete invoice";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Editing rules by plan:
   * - Free plan users can update status, bank details, and notes from the edit modal / success view.
   * - Professional & Enterprise plans unlock full editing (items, totals, dates, currency, etc.) directly inside InvoiceSuccessView.
   * - Any plan can delete an invoice entirely and recreate it if that is easier.
   */

  // Safe date formatter that tolerates null/invalid inputs
  const formatDate = (value: unknown) => {
    if (!value) return "N/A";
    let d: Date;
    if (value instanceof Date) d = value;
    else if (typeof value === "string" || typeof value === "number")
      d = new Date(value);
    else d = new Date(String(value));
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-header-text dark:text-slate-100">
          All Invoices
        </h2>
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <CustomModal
            heading="Search & Filter Invoices"
            description="Find specific invoices or filter by status"
            openBtnLabel="Filter"
            btnVariant="secondary"
            btnIcon={FilterIcon}
          >
            <SearchAndFilter
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              searchTerm={search}
              currentFilter={filter}
            />
          </CustomModal>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="hidden border-b w-full py-3 px-4 border-blue-100 md:grid md:grid-cols-7 md:gap-2">
            <div className="font-medium text-secondary-text dark:text-slate-400">
              Invoice
            </div>
            <div className="font-medium text-secondary-text dark:text-slate-400">
              Amount
            </div>
            <div className="font-medium text-secondary-text dark:text-slate-400">
              Status
            </div>
            <div className="font-medium text-secondary-text dark:text-slate-400">
              Issue Date
            </div>
            <div className="font-medium text-secondary-text dark:text-slate-400">
              Due Date
            </div>
            <div className="font-medium text-secondary-text dark:text-slate-400">
              Email Status
            </div>
            <div className="text-right font-medium text-secondary-text dark:text-slate-400">
              Actions
            </div>
          </div>

          {invoiceRows.length > 0 ? (
            <div className="space-y-4 md:space-y-0 md:divide-y md:divide-blue-100 dark:md:divide-slate-700">
              {invoiceRows.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid w-full grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 md:grid-cols-7 md:gap-2 md:rounded-none md:border-0 md:bg-transparent md:px-4 md:py-3 md:shadow-none md:hover:bg-blue-50/50 dark:md:hover:bg-slate-800"
                >
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Invoice
                    </span>
                    <p className="font-medium text-header-text dark:text-slate-100">
                      {invoice.invoice_number}
                    </p>
                    <p className="text-sm text-secondary-text dark:text-slate-400">
                      {invoice.description || "No description"}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Amount
                    </span>
                    <p className="font-semibold text-header-text dark:text-slate-100">
                      {formatInvoiceAmount(invoice.total, invoice.currency)}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Status
                    </span>
                    <div className="mt-1 md:mt-0">
                      {getStatusBadge(invoice?.status || "draft")}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Issue Date
                    </span>
                    <p className="text-header-text dark:text-slate-100">
                      {invoice.issue_date
                        ? formatDate(invoice.issue_date)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Due Date
                    </span>
                    <p className="text-header-text dark:text-slate-100">
                      {formatDate(invoice.due_date)}
                    </p>
                  </div>

                  {/* Email Status Column */}
                  <div className="col-span-2 md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Email Status
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-1 md:mt-0">
                      {(() => {
                        const badges = buildEmailStatusBadges(invoice);

                        if (!badges.length) {
                          return (
                            <span className="text-xs text-gray-400 dark:text-slate-500">
                              Not sent
                            </span>
                          );
                        }

                        return badges.map((badge, index) => (
                          <Fragment key={`${invoice.id}-${badge.key}`}>
                            <Badge className={`${badge.className} text-xs`}>
                              {badge.label}
                            </Badge>
                            {index < badges.length - 1 && (
                              <span className="text-xs text-gray-400 dark:text-slate-500">
                                →
                              </span>
                            )}
                          </Fragment>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-blue-100 pt-3 md:col-span-1 md:border-none md:pt-0 md:text-right dark:border-slate-700">
                    <span className="md:hidden text-xs font-semibold uppercase tracking-wide text-secondary-text dark:text-slate-400">
                      Actions
                    </span>
                    <div className="mt-3 flex flex-wrap items-center justify-start gap-2 md:mt-0 md:justify-end">
                      <Link
                        href={`/dashboard/invoices/success?business_id=${business_id}&invoice_id=${invoice.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-100 dark:hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <CustomModal
                        heading="More Actions"
                        description={`Actions for invoice ${invoice.invoice_number}`}
                        customTrigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-100 dark:hover:bg-slate-700"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <div className="space-y-2">
                          <Link
                            href={`/dashboard/invoices/success?business_id=${business_id}&invoice_id=${invoice.id}`}
                            className="block"
                          >
                            <Button
                              variant="secondary"
                              className="w-full justify-start dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Invoice
                            </Button>
                          </Link>

                          <Link
                            href={`/dashboard/invoices/success?business_id=${business_id}&invoice_id=${invoice.id}&edit=1`}
                            className="block"
                          >
                            <Button
                              variant="secondary"
                              className="w-full justify-start dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {userPlan === "free_user"
                                ? "Modify Status/Notes"
                                : "Edit Invoice"}
                            </Button>
                          </Link>

                          <Button
                            variant="secondary"
                            className="w-full justify-start text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                            onClick={() => handleSendToClient(invoice)}
                            disabled={isSending === invoice.id}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {isSending === invoice.id
                              ? "Sending..."
                              : "Send to Client"}
                          </Button>

                          <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
                            <Button
                              variant="secondary"
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:bg-slate-700 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteInvoice(invoice)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Invoice
                            </Button>
                          </div>
                        </div>
                      </CustomModal>
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button
                  variant="neutralOutline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  Page {currentPage}
                </span>
                <Button
                  variant="neutralOutline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={invoiceRows.length < PAGE_SIZE}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold text-header-text dark:text-slate-100 mb-2">
                No Invoices Yet
              </h3>
              <p className="text-secondary-text dark:text-slate-400 mb-6">
                Create your first invoice to start tracking payments and
                managing your business.
              </p>
              <CustomButton
                label="Create Your First Invoice"
                icon={PlusIcon}
                variant="primary"
                href={`/dashboard/invoices/new?business_id=${business_id}`}
              />
            </div>
          )}
        </div>

        {/* Delete Invoice Dialog */}
        <Dialog
          open={!!invoiceToDelete}
          onOpenChange={(open) => !open && setInvoiceToDelete(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Delete Invoice
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this invoice? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            {invoiceToDelete && (
              <div className="py-4 space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500 dark:text-slate-400">
                      Invoice Number:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-200 text-right">
                      {invoiceToDelete.invoice_number}
                    </span>

                    <span className="text-gray-500 dark:text-slate-400">
                      Client:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-200 text-right">
                      {invoiceToDelete.bill_to?.name || "Unknown Client"}
                    </span>

                    <span className="text-gray-500 dark:text-slate-400">
                      Amount:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-200 text-right">
                      {formatInvoiceAmount(
                        invoiceToDelete.total,
                        invoiceToDelete.currency
                      )}
                    </span>

                    <span className="text-gray-500 dark:text-slate-400">
                      Date:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-200 text-right">
                      {invoiceToDelete.issue_date
                        ? format(new Date(invoiceToDelete.issue_date), "PPP")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="neutralOutline"
                onClick={() => setInvoiceToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteInvoice}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white bg-none border-none"
              >
                {isDeleting ? "Deleting..." : "Delete Invoice"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
