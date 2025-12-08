import jsPDF from "jspdf";
import type { InvoiceListItem, BusinessType } from "@/types";

interface InvoiceItemRow {
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax?: number;
  amount?: number;
}

interface ParsedBillTo {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
}

// Colors for clean professional invoice - always light for printing
const COLORS = {
  text: [17, 24, 39] as [number, number, number], // slate-900
  textMuted: [107, 114, 128] as [number, number, number], // gray-500
  border: [229, 231, 235] as [number, number, number], // gray-200
  accent: [59, 130, 246] as [number, number, number], // blue-500
  white: [255, 255, 255] as [number, number, number],
  tableHeaderBg: [249, 250, 251] as [number, number, number], // gray-50
};

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GBP: "£",
    EUR: "€",
    USD: "$",
    CAD: "CA$",
    AUD: "A$",
  };
  return symbols[currency?.toUpperCase()] || currency + " ";
}

function formatMoney(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))}`;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function parseItems(items: InvoiceListItem["items"]): InvoiceItemRow[] {
  try {
    if (Array.isArray(items)) return items;
    if (typeof items === "string") return JSON.parse(items);
    if (items && typeof items === "object") return Object.values(items);
  } catch {}
  return [];
}

function parseBillTo(billTo: InvoiceListItem["bill_to"]): ParsedBillTo | null {
  try {
    if (!billTo) return null;
    if (typeof billTo === "string") return JSON.parse(billTo);
    if (typeof billTo === "object") return billTo as ParsedBillTo;
  } catch {}
  return null;
}

export async function generateInvoicePDF(
  invoice: InvoiceListItem,
  company: BusinessType
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  // White background
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  let y = margin;

  // ============================================================
  // HEADER SECTION
  // ============================================================

  // Left side: Company logo/name
  let logoHeight = 0;
  if (company.logo) {
    try {
      doc.addImage(company.logo, "AUTO", margin, y, 50, 25, undefined, "FAST");
      logoHeight = 30;
    } catch {
      // Logo failed, continue without it
    }
  }

  const headerTextY = logoHeight > 0 ? y + logoHeight : y;

  // Company name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(company.name || "Company Name", margin, headerTextY);

  // Company details below name
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);

  let companyY = headerTextY + 5;
  if (company.email) {
    doc.text(company.email, margin, companyY);
    companyY += 4;
  }
  if (company.address) {
    doc.text(company.address.replace(/\n/g, ", "), margin, companyY);
    companyY += 4;
  }

  // Right side: Invoice number badge + INVOICE title
  const rightX = pageWidth - margin;

  // Invoice number in blue pill
  const invoiceNum = invoice.invoice_number || "INV0001";
  doc.setFillColor(219, 234, 254); // blue-100
  const badgeWidth = doc.getTextWidth(invoiceNum) + 12;
  doc.roundedRect(rightX - badgeWidth, y, badgeWidth, 7, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.accent);
  doc.text(invoiceNum, rightX - badgeWidth / 2, y + 5, { align: "center" });

  // INVOICE title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("INVOICE", rightX, y + 16, { align: "right" });

  y = Math.max(companyY, y + 25) + 10;

  // Divider line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ============================================================
  // BILL TO & DATES SECTION (two columns)
  // ============================================================
  const leftColX = margin;
  const rightColX = margin + contentWidth / 2 + 10;
  const sectionStartY = y;

  // Left column: Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("BILL TO", leftColX, y);
  y += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(billTo?.name || "Client Name", leftColX, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);

  if (billTo?.email) {
    doc.text(billTo.email, leftColX, y);
    y += 4;
  }
  if (billTo?.address) {
    doc.text(billTo.address.replace(/\n/g, ", "), leftColX, y);
    y += 4;
  }

  // Right column: Dates
  let dateY = sectionStartY;

  // Issue Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Issue Date", rightColX, dateY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    pageWidth - margin,
    dateY,
    { align: "right" }
  );
  dateY += 7;

  // Due Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Due Date", rightColX, dateY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(formatDate(invoice.due_date), pageWidth - margin, dateY, {
    align: "right",
  });

  y = Math.max(y, dateY) + 15;

  // ============================================================
  // DESCRIPTION (if exists)
  // ============================================================
  if (invoice.description?.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    const descLines = doc.splitTextToSize(invoice.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4 + 10;
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  // Table header
  const colDesc = margin;
  const colQty = margin + contentWidth * 0.55;
  const colRate = margin + contentWidth * 0.7;
  const colAmount = pageWidth - margin;

  // Header row with underline
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("DESCRIPTION", colDesc, y);
  doc.text("QTY", colQty, y, { align: "right" });
  doc.text("RATE", colRate, y, { align: "right" });
  doc.text("AMOUNT", colAmount, y, { align: "right" });

  y += 3;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Table rows
  items.forEach((item, index) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text((item.description || "—").substring(0, 50), colDesc, y);

    doc.setTextColor(...COLORS.textMuted);
    doc.text(String(item.quantity || 0), colQty, y, { align: "right" });
    doc.text(formatMoney(item.unit_price || 0, currency), colRate, y, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(formatMoney(item.amount || 0, currency), colAmount, y, {
      align: "right",
    });

    // Row separator (except last)
    if (index < items.length - 1) {
      y += 4;
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    } else {
      y += 10;
    }
  });

  y += 10;

  // ============================================================
  // SUMMARY SECTION (right aligned)
  // ============================================================
  const summaryWidth = 70;
  const summaryX = pageWidth - margin - summaryWidth;

  // Subtotal
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Subtotal", summaryX, y);
  doc.setTextColor(...COLORS.text);
  doc.text(
    formatMoney(invoice.subtotal || 0, currency),
    pageWidth - margin,
    y,
    { align: "right" }
  );
  y += 6;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Discount", summaryX, y);
    doc.setTextColor(34, 197, 94); // green
    doc.text(`-${invoice.discount}%`, pageWidth - margin, y, {
      align: "right",
    });
    y += 6;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Shipping", summaryX, y);
    doc.setTextColor(...COLORS.text);
    doc.text(
      formatMoney(parseFloat(String(invoice.shipping)), currency),
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 6;
  }

  // Total line
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(summaryX, y, pageWidth - margin, y);
  y += 8;

  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text("Total", summaryX, y);
  doc.setTextColor(...COLORS.accent); // Blue total
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 20;

  // ============================================================
  // BANK DETAILS (if any)
  // ============================================================
  if (invoice.bank_details) {
    let bankData: Record<string, string> | null = null;
    try {
      bankData =
        typeof invoice.bank_details === "string"
          ? JSON.parse(invoice.bank_details)
          : (invoice.bank_details as Record<string, string>);
    } catch {}

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textMuted);
    doc.text("PAYMENT DETAILS", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);

    if (bankData) {
      Object.entries(bankData).forEach(([key, value]) => {
        if (value) {
          const label = key
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          doc.setTextColor(...COLORS.textMuted);
          doc.text(`${label}:`, margin, y);
          doc.setTextColor(...COLORS.text);
          doc.text(String(value), margin + 35, y);
          y += 5;
        }
      });
    } else if (typeof invoice.bank_details === "string") {
      doc.text(invoice.bank_details, margin, y);
    }

    y += 10;
  }

  // ============================================================
  // NOTES (if any)
  // ============================================================
  if (invoice.notes?.trim()) {
    // Light gray background box for notes
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth - 16);
    const notesHeight = Math.max(20, notesLines.length * 4 + 12);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(margin, y, contentWidth, notesHeight, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textMuted);
    doc.text("NOTES", margin + 8, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(notesLines, margin + 8, y + 14);
  }

  // Save
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
