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

  // Blue border at top (like preview)
  doc.setFillColor(...hexToRgb(c.accent));
  doc.rect(0, 0, pageWidth, 4, "F");

  let y = margin + 4;

  // ============================================================
  // HEADER: Company name (left) | INVOICE title (right)
  // ============================================================

  // Company name - bold, large
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(company.name || "Company Name", margin, y + 5);

  // INVOICE title - right aligned (black/white text, not blue)
  doc.setFontSize(28);
  doc.setTextColor(...hexToRgb(c.text));
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

  y = Math.max(y, detailsBoxY + detailsBoxH) + 10;

  // ============================================================
  // DIVIDER LINE (under invoice details)
  // ============================================================
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 10;

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
  // DESCRIPTION CARD (if exists) - smaller height
  // ============================================================
  if (invoice.description?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("DESCRIPTION", margin, y);
    y += 5;

    // Calculate height based on text
    const descLines = doc.splitTextToSize(
      invoice.description,
      contentWidth - 10
    );
    const descCardH = Math.max(12, descLines.length * 5 + 6);

    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, contentWidth, descCardH, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(descLines, margin + 5, y + 7);

    y += descCardH + 8;
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  // Table header with background
  const tableHeaderH = 10;
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(margin, y - 2, contentWidth, tableHeaderH, 2, 2, "F");

  const colDesc = margin + 5;
  const colQty = margin + contentWidth * 0.48;
  const colPrice = margin + contentWidth * 0.62;
  const colTax = margin + contentWidth * 0.78;
  const colAmount = rightEdge - 5;

  // Table header text
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("DESCRIPTION", colDesc, y + 4);
  doc.text("QTY", colQty, y + 4, { align: "center" });
  doc.text("UNIT PRICE", colPrice, y + 4, { align: "center" });
  doc.text("TAX", colTax, y + 4, { align: "center" });
  doc.text("AMOUNT", colAmount, y + 4, { align: "right" });

  y += tableHeaderH + 6;

  // Table rows
  items.forEach((item, index) => {
    // Row separator line
    if (index > 0) {
      doc.setDrawColor(...hexToRgb(c.border));
      doc.setLineWidth(0.2);
      doc.line(margin, y - 4, rightEdge, y - 4);
    }

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

  // Line under items table
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.line(margin, y - 2, rightEdge, y - 2);

  y += 12;

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

    // Calculate bank card height based on content
    let bankLines: string[] = [];
    if (bankData) {
      bankLines = Object.entries(bankData)
        .filter(([_, v]) => v)
        .map(([_, v]) => String(v));
    } else if (typeof invoice.bank_details === "string") {
      bankLines = invoice.bank_details
        .split(/[\n,]/)
        .map((l) => l.trim())
        .filter(Boolean);
    }

    const bankCardH = Math.max(20, bankLines.length * 5 + 10);
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, halfWidth, bankCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));

    let bankTextY = y + 8;
    bankLines.slice(0, 4).forEach((line) => {
      doc.text(line.substring(0, 40), margin + 5, bankTextY);
      bankTextY += 5;
    });
  }

  // INVOICE SUMMARY (right side) - with header bar like preview
  const summaryX = margin + halfWidth + 10;
  const summaryW = halfWidth;
  const summaryHeaderH = 10;
  const summaryBodyH = 32;
  const summaryH = summaryHeaderH + summaryBodyH;

  // Summary header bar (darker slate-800)
  const headerBg = theme === "dark" ? "#334155" : "#1e293b";
  doc.setFillColor(...hexToRgb(headerBg));
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryHeaderH, 3, 3, "F");
  // Fill the bottom corners
  doc.rect(summaryX, summaryStartY + summaryHeaderH - 3, summaryW, 3, "F");

  // Summary body
  const bodyBg = theme === "dark" ? "#1e293b" : "#ffffff";
  doc.setFillColor(...hexToRgb(bodyBg));
  doc.roundedRect(
    summaryX,
    summaryStartY + summaryHeaderH,
    summaryW,
    summaryBodyH,
    3,
    3,
    "F"
  );
  // Fill the top corners
  doc.rect(summaryX, summaryStartY + summaryHeaderH, summaryW, 3, "F");

  // Border around the whole summary
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryH, 3, 3, "S");

  // Summary header text
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255); // White text on dark header
  doc.text("INVOICE SUMMARY", summaryX + 5, summaryStartY + 7);

  // Subtotal
  let sumY = summaryStartY + summaryHeaderH + 10;
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

  // Line under subtotal
  sumY += 5;
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.2);
  doc.line(summaryX + 5, sumY, summaryX + summaryW - 5, sumY);

  sumY += 8;

  // Total
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("Total", summaryX + 5, sumY);
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
