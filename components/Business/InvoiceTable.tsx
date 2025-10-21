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
} from "lucide-react";
import getStatusBadge from "../ui/getStatusBadge";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import CustomModal from "../ModalsForms/CustomModal";
import jsPDF from "jspdf";

// Invoice Preview Component for Modal
function InvoicePreview({
  invoice,
  onDownload,
  closeModal,
}: {
  invoice: InvoiceListItem;
  onDownload: (invoice: InvoiceListItem) => void;
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
                {invoice.currency || "GBP"}
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Subtotal:
              </span>
              <p className="text-header-text dark:text-slate-100">
                £{(invoice.subtotal || 0).toFixed(2)}
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
                  £{(invoice.shipping ?? 0).toFixed(2)}
                </p>
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Total Amount:
              </span>
              <p className="text-xl font-bold text-primary">{invoice.total}</p>
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
                  Qty
                </th>
                <th className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-right font-semibold">
                  Unit Price
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
                        £{unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-center">
                        {tax}%
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 px-4 py-3 text-right font-medium">
                        £{amount.toFixed(2)}
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
        <Button
          onClick={() => onDownload(invoice)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
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
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

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

  // Enhanced PDF Download function
  const handleDownloadPDF = async (invoice: InvoiceListItem) => {
    setIsDownloading(invoice.id);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Parse invoice data
      let items: any[] = [];
      let billTo = null;
      let companyDetails = null;

      try {
        if (Array.isArray(invoice.items)) {
          items = invoice.items;
        } else if (typeof invoice.items === "string") {
          items = JSON.parse(invoice.items);
        }
      } catch (e) {
        items = [];
      }

      try {
        if (typeof invoice.bill_to === "string") {
          billTo = JSON.parse(invoice.bill_to);
        } else if (invoice.bill_to) {
          billTo = invoice.bill_to;
        }
      } catch (e) {
        billTo = null;
      }

      try {
        if (typeof invoice.company_details === "string") {
          companyDetails = JSON.parse(invoice.company_details);
        } else if (invoice.company_details) {
          companyDetails = invoice.company_details;
        }
      } catch (e) {
        companyDetails = null;
      }

      // PDF Header
      doc.setFontSize(24);
      doc.setTextColor(44, 82, 130);
      doc.text("INVOICE", pageWidth / 2, 30, { align: "center" });

      // Invoice details section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      // Left side - Company info
      if (companyDetails) {
        doc.setFontSize(14);
        doc.text("From:", 20, 50);
        doc.setFontSize(11);
        let yPos = 60;
        doc.text(companyDetails.name || "", 20, yPos);
        yPos += 8;
        doc.text(companyDetails.email || "", 20, yPos);
        if (companyDetails.phone) {
          yPos += 8;
          doc.text(companyDetails.phone, 20, yPos);
        }
        if (companyDetails.address) {
          yPos += 8;
          doc.text(companyDetails.address, 20, yPos);
        }
      }

      // Right side - Invoice info
      doc.setFontSize(11);
      doc.text(`Invoice #: ${invoice.invoice_number}`, pageWidth - 100, 50);
      doc.text(
        `Issue Date: ${
          invoice.issue_date
            ? new Date(invoice.issue_date).toLocaleDateString()
            : "N/A"
        }`,
        pageWidth - 100,
        60
      );
      doc.text(
        `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`,
        pageWidth - 100,
        70
      );
      const statusLabel = invoice?.status
        ? String(invoice.status).toUpperCase()
        : "N/A";
      doc.text(`Status: ${statusLabel}`, pageWidth - 100, 80);

      // Bill To section
      if (billTo) {
        doc.setFontSize(14);
        doc.text("Bill To:", 20, 100);
        doc.setFontSize(11);
        let yPos = 110;
        doc.text(billTo.name || "", 20, yPos);
        yPos += 8;
        doc.text(billTo.email || "", 20, yPos);
        if (billTo.phone) {
          yPos += 8;
          doc.text(billTo.phone, 20, yPos);
        }
        if (billTo.address) {
          yPos += 8;
          doc.text(billTo.address, 20, yPos);
        }
      }

      // Items table
      if (items.length > 0) {
        const tableTop = 150;
        doc.setFontSize(11);

        // Table headers
        doc.text("Description", 20, tableTop);
        doc.text("Qty", 120, tableTop);
        doc.text("Price", 140, tableTop);
        doc.text("Tax", 160, tableTop);
        doc.text("Amount", 180, tableTop);

        // Header line
        doc.line(15, tableTop + 5, pageWidth - 15, tableTop + 5);

        let yPos = tableTop + 15;
        items.forEach((item) => {
          const quantity = Number(item.quantity) || 0;
          const unitPrice = Number(item.unit_price) || 0;
          const tax = Number(item.tax) || 0;
          const amount = Number(item.amount) || 0;

          doc.text(item.description || "No description", 20, yPos);
          doc.text(quantity.toString(), 120, yPos);
          doc.text(`£${unitPrice.toFixed(2)}`, 140, yPos);
          doc.text(`${tax}%`, 160, yPos);
          doc.text(`£${amount.toFixed(2)}`, 180, yPos);
          yPos += 10;
        });

        // Totals section
        yPos += 10;
        doc.line(15, yPos, pageWidth - 15, yPos);
        yPos += 15;

        if (invoice.subtotal) {
          doc.text(
            `Subtotal: £${invoice.subtotal.toFixed(2)}`,
            pageWidth - 80,
            yPos
          );
          yPos += 10;
        }
        if (invoice.discount && invoice.discount > 0) {
          doc.text(
            `Discount (${invoice.discount}%): -£${(
              (invoice.subtotal || 0) *
              (invoice.discount / 100)
            ).toFixed(2)}`,
            pageWidth - 80,
            yPos
          );
          yPos += 10;
        }
        if (invoice.shipping && invoice.shipping > 0) {
          doc.text(
            `Shipping: £${invoice.shipping.toFixed(2)}`,
            pageWidth - 80,
            yPos
          );
          yPos += 10;
        }

        // Total line
        doc.line(pageWidth - 100, yPos + 2, pageWidth - 15, yPos + 2);
        doc.setFontSize(14);
        yPos += 15;
        doc.text(`Total: ${invoice.total}`, pageWidth - 80, yPos);
      }

      // Notes and bank details
      let notesYPos = 250;
      if (invoice.notes) {
        doc.setFontSize(12);
        doc.text("Notes:", 20, notesYPos);
        doc.setFontSize(10);
        const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
        doc.text(noteLines, 20, notesYPos + 10);
        notesYPos += 10 + noteLines.length * 5;
      }

      if (invoice.bank_details) {
        doc.setFontSize(12);
        doc.text("Payment Details:", 20, notesYPos + 10);
        doc.setFontSize(10);
        const bankLines = doc.splitTextToSize(
          invoice.bank_details,
          pageWidth - 40
        );
        doc.text(bankLines, 20, notesYPos + 20);
      }

      // Save the PDF
      doc.save(`invoice-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  /**
   * NOTE: Invoice Editing is intentionally restricted to maintain plan limit integrity.
   *
   * REASON: Invoice creation counts against plan limits (Free: 1 invoice, Pro: 10/month).
   * Full editing would allow users to create unlimited invoices by repeatedly editing
   * the same one, bypassing plan restrictions.
   *
   * ALLOWED MODIFICATIONS:
   * - Status changes (draft → sent → paid → overdue → cancelled)
   * - Bank details (account type, name, sort code, account number)
   * - Internal notes & terms
   *
   * RESTRICTED (to maintain invoice integrity):
   * - Invoice items (description, price, quantity)
   * - Client information
   * - Invoice date/number
   * - Amounts/totals (subtotal, discount, shipping, total)
   * - Company details
   *
   * RATIONALE:
   * - Bank details: Often need updates for payment instructions without changing invoice
   * - Notes: Need to add payment terms, late fees, or special instructions
   * - Status: Required for invoice lifecycle management
   * - Everything else: Changing would essentially create a "new" invoice, bypassing limits
   *
   * If client needs to change invoice content, they should:
   * 1. Delete the incorrect invoice (frees up the slot)
   * 2. Create a new corrected invoice
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
    <>
      <Card>
        <CardHeader className="flex justify-between">
          <h2 className="text-xl font-bold text-header-text dark:text-slate-100">
            All Invoices
          </h2>
          <div className="flex items-center gap-3">
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
          <div className="overflow-x-auto lg:w-full w-[1200px]">
            <div className="w-full">
              <div className="border-b w-full py-3 px-4 border-blue-100 grid grid-cols-6 gap-2">
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
                <div className="text-right font-medium text-secondary-text dark:text-slate-400">
                  Actions
                </div>
              </div>

              {invoices.length > 0 ? (
                <div>
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="border-b border-blue-50 hover:bg-blue-50/50 w-full py-3 px-4 grid grid-cols-6 gap-2"
                    >
                      <div>
                        <p className="font-medium text-header-text dark:text-slate-100">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-sm text-secondary-text dark:text-slate-400">
                          {invoice.description || "No description"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-header-text dark:text-slate-100">
                          {invoice.total}
                        </p>
                      </div>
                      <div>{getStatusBadge(invoice?.status || "draft")}</div>
                      <div>
                        <p className="text-header-text dark:text-slate-100">
                          {invoice.issue_date
                            ? formatDate(invoice.issue_date)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-header-text dark:text-slate-100">
                          {formatDate(invoice.due_date)}
                        </p>
                      </div>

                      <div className="w-full">
                        <div className="flex items-center justify-end gap-2">
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

                          <Link
                            href={`/dashboard/invoices/success?business_id=${business_id}&invoice_id=${invoice.id}&download=1`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-100 dark:hover:bg-slate-700"
                            >
                              <Download className="h-4 w-4" />
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
                                  {userPlan === "enterprise"
                                    ? "Edit Invoice"
                                    : "Modify Status/Notes"}
                                </Button>
                              </Link>

                              <Link
                                href={`/dashboard/invoices/success?business_id=${business_id}&invoice_id=${invoice.id}&download=1`}
                                className="block"
                              >
                                <Button
                                  variant="secondary"
                                  className="w-full justify-start dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </Button>
                              </Link>

                              <Button
                                variant="secondary"
                                className="w-full justify-start text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                                onClick={() => {
                                  // TODO: Implement email sending functionality
                                  alert("Email functionality coming soon");
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send to Client
                              </Button>

                              <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
                                <Button
                                  variant="secondary"
                                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:bg-slate-700 dark:hover:bg-red-900/20"
                                  onClick={() => {
                                    // TODO: Implement delete with confirmation
                                    if (
                                      confirm(
                                        `Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`
                                      )
                                    ) {
                                      alert("Delete functionality coming soon");
                                    }
                                  }}
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
          </div>
        </CardContent>
      </Card>
    </>
  );
}
