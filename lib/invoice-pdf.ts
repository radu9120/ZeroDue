import jsPDF from "jspdf";
import type { InvoiceListItem, BusinessType } from "@/types";

export type PDFTheme = "light" | "dark";

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

// Dark theme colors matching the preview
const COLORS = {
  dark: {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    border: "#334155",
    accent: "#3b82f6",
  },
  light: {
    bg: "#ffffff",
    cardBg: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    accent: "#3b82f6",
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

function getCurrencySymbol(currency: string): string {
  const code = currency.toUpperCase();
  const symbols: Record<string, string> = {
    GBP: "£",
    EUR: "€",
    USD: "$",
    JPY: "¥",
    CAD: "CA$",
    AUD: "A$",
    CHF: "CHF ",
    INR: "₹",
  };
  // For PDF, use text-safe versions
  const pdfSymbols: Record<string, string> = {
    GBP: "GBP ",
    EUR: "EUR ",
    JPY: "JPY ",
    INR: "INR ",
    CHF: "CHF ",
  };
  return pdfSymbols[code] || symbols[code] || code + " ";
}

function formatMoney(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return symbol + formatted;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
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
  company: BusinessType,
  theme: PDFTheme = "light"
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const c = theme === "dark" ? COLORS.dark : COLORS.light;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const rightEdge = pageWidth - margin;
  const contentWidth = pageWidth - margin * 2;
  const halfWidth = contentWidth / 2 - 5;

  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  // Background
  doc.setFillColor(...hexToRgb(c.bg));
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  let y = margin;

  // ============================================================
  // HEADER: Company name (left) | INVOICE title (right)
  // ============================================================

  // Company name - bold, large
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(company.name || "Company Name", margin, y + 5);

  // INVOICE title - right aligned
  doc.setFontSize(28);
  doc.setTextColor(...hexToRgb(c.accent));
  doc.text("INVOICE", rightEdge, y + 5, { align: "right" });

  y += 12;

  // Company address lines
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));

  if (company.address) {
    const addrLines = company.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addrLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 4;
    });
  }
  if (company.email) {
    doc.text(company.email, margin, y);
    y += 4;
  }

  // ============================================================
  // INVOICE DETAILS BOX (right side, next to company info)
  // ============================================================
  const detailsBoxX = margin + halfWidth + 10;
  const detailsBoxY = margin + 12;
  const detailsBoxW = halfWidth;
  const detailsBoxH = 32;

  // Box background
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(
    detailsBoxX,
    detailsBoxY,
    detailsBoxW,
    detailsBoxH,
    3,
    3,
    "F"
  );

  // Box content
  let detY = detailsBoxY + 8;
  doc.setFontSize(9);

  // Invoice #
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Invoice #", detailsBoxX + 5, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    invoice.invoice_number || "INV0001",
    detailsBoxX + detailsBoxW - 5,
    detY,
    { align: "right" }
  );
  detY += 8;

  // Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Date", detailsBoxX + 5, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    detailsBoxX + detailsBoxW - 5,
    detY,
    { align: "right" }
  );
  detY += 8;

  // Due Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Due Date", detailsBoxX + 5, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(formatDate(invoice.due_date), detailsBoxX + detailsBoxW - 5, detY, {
    align: "right",
  });

  y = Math.max(y, detailsBoxY + detailsBoxH) + 15;

  // ============================================================
  // DIVIDER
  // ============================================================
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 12;

  // ============================================================
  // BILL TO CARD
  // ============================================================
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("BILL TO", margin, y);
  y += 5;

  // Bill To card background
  const billCardH = 28;
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(margin, y, contentWidth, billCardH, 3, 3, "F");

  // Bill To content
  let billY = y + 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(billTo?.name || "Client Name", margin + 5, billY);
  billY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  if (billTo?.address) {
    doc.text(billTo.address, margin + 5, billY);
    billY += 4;
  }
  if (billTo?.email) {
    doc.text(billTo.email, margin + 5, billY);
  }

  y += billCardH + 10;

  // ============================================================
  // DESCRIPTION CARD (if exists)
  // ============================================================
  if (invoice.description?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("DESCRIPTION", margin, y);
    y += 5;

    const descCardH = 15;
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, contentWidth, descCardH, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(invoice.description, margin + 5, y + 9);

    y += descCardH + 10;
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================
  const colDesc = margin;
  const colQty = margin + contentWidth * 0.45;
  const colPrice = margin + contentWidth * 0.58;
  const colTax = margin + contentWidth * 0.75;
  const colAmount = rightEdge;

  // Table header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("DESCRIPTION", colDesc, y);
  doc.text("QTY", colQty, y, { align: "center" });
  doc.text("UNIT PRICE", colPrice, y, { align: "center" });
  doc.text("TAX", colTax, y, { align: "center" });
  doc.text("AMOUNT", colAmount, y, { align: "right" });

  y += 4;
  doc.setDrawColor(...hexToRgb(c.border));
  doc.line(margin, y, rightEdge, y);
  y += 8;

  // Table rows
  items.forEach((item) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text((item.description || "—").substring(0, 35), colDesc, y);

    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text(String(item.quantity || 0), colQty, y, { align: "center" });
    doc.text(formatMoney(item.unit_price || 0, currency), colPrice, y, {
      align: "center",
    });
    doc.text(`${item.tax || 0}%`, colTax, y, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(formatMoney(item.amount || 0, currency), colAmount, y, {
      align: "right",
    });

    y += 10;
  });

  y += 10;

  // ============================================================
  // BANK DETAILS (left) & INVOICE SUMMARY (right)
  // ============================================================
  const summaryStartY = y;

  // BANK DETAILS (left side)
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
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("BANK DETAILS", margin, y);
    y += 5;

    const bankCardH = 20;
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, halfWidth, bankCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));

    if (bankData) {
      const bankText = Object.entries(bankData)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      doc.text(bankText.substring(0, 50), margin + 5, y + 12);
    } else if (typeof invoice.bank_details === "string") {
      doc.text(invoice.bank_details.substring(0, 50), margin + 5, y + 12);
    }
  }

  // INVOICE SUMMARY (right side)
  const summaryX = margin + halfWidth + 10;
  const summaryW = halfWidth;
  const summaryH = 35;

  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryH, 3, 3, "F");

  // Summary header
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("INVOICE SUMMARY", summaryX + 5, summaryStartY + 8);

  // Subtotal
  let sumY = summaryStartY + 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Subtotal", summaryX + 5, sumY);
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatMoney(invoice.subtotal || 0, currency),
    summaryX + summaryW - 5,
    sumY,
    { align: "right" }
  );

  sumY += 8;

  // Total
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Total", summaryX + 5, sumY);
  doc.setTextColor(...hexToRgb(c.accent));
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    summaryX + summaryW - 5,
    sumY,
    { align: "right" }
  );

  y = summaryStartY + summaryH + 15;

  // ============================================================
  // NOTES
  // ============================================================
  if (invoice.notes?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("NOTES", margin, y);
    y += 5;

    const notesCardH = 18;
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, halfWidth, notesCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(invoice.notes.substring(0, 60), margin + 5, y + 10);
  }

  // ============================================================
  // SAVE
  // ============================================================
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
