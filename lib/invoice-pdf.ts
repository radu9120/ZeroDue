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

// Colors matching the preview exactly
const COLORS = {
  light: {
    white: "#ffffff",
    text: "#0f172a", // slate-900
    textMuted: "#64748b", // slate-500
    textLight: "#94a3b8", // slate-400
    border: "#f1f5f9", // slate-100
    borderMedium: "#e2e8f0", // slate-200
    borderDark: "#cbd5e1", // slate-300
    blue: "#2563eb", // blue-600
    blueBg: "#dbeafe", // blue-100
    notesBg: "#f8fafc", // slate-50
    green: "#16a34a", // green-600
  },
  dark: {
    white: "#020617", // slate-950
    text: "#f8fafc", // slate-50
    textMuted: "#94a3b8", // slate-400
    textLight: "#cbd5e1", // slate-300
    border: "#1e293b", // slate-800
    borderMedium: "#334155", // slate-700
    borderDark: "#475569", // slate-600
    blue: "#60a5fa", // blue-400
    blueBg: "#1e3a5f", // blue-900/40
    notesBg: "#1e293b", // slate-800
    green: "#4ade80", // green-400
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
  // Use text for symbols that don't render in PDF fonts
  const textSymbols: Record<string, string> = {
    GBP: "GBP ",
    EUR: "EUR ",
    JPY: "JPY ",
    CNY: "CNY ",
    INR: "INR ",
    CHF: "CHF ",
    SEK: "SEK ",
    NOK: "NOK ",
    DKK: "DKK ",
    PLN: "PLN ",
    AED: "AED ",
    SAR: "SAR ",
    KRW: "KRW ",
    THB: "THB ",
    RUB: "RUB ",
  };
  const symbols: Record<string, string> = {
    USD: "$",
    CAD: "CA$",
    AUD: "A$",
    NZD: "NZ$",
    HKD: "HK$",
    SGD: "S$",
    MXN: "MX$",
    BRL: "R$",
    ZAR: "R",
  };
  return textSymbols[code] || symbols[code] || code + " ";
}

function formatMoney(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return (amount < 0 ? "-" : "") + symbol + formatted;
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
  company: BusinessType,
  theme: PDFTheme = "light"
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const c = theme === "dark" ? COLORS.dark : COLORS.light;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const rightEdge = pageWidth - margin;
  const contentWidth = pageWidth - margin * 2;

  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  let y = margin;

  // ============================================================
  // HEADER SECTION - Logo left, Invoice badge + title right
  // ============================================================

  // Right side: Invoice number badge
  const invoiceNum = invoice.invoice_number || "INV0001";
  doc.setFillColor(...hexToRgb(c.blueBg));
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const badgeTextWidth = doc.getTextWidth(invoiceNum);
  const badgeWidth = badgeTextWidth + 16;
  const badgeX = rightEdge - badgeWidth;
  doc.roundedRect(badgeX, y, badgeWidth, 8, 4, 4, "F");

  // Badge text with # icon simulation
  doc.setTextColor(...hexToRgb(c.blue));
  doc.text("#", badgeX + 5, y + 5.5);
  doc.text(invoiceNum, badgeX + 10, y + 5.5);

  // INVOICE title below badge
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("INVOICE", rightEdge, y + 20, { align: "right" });

  // Left side: Logo
  let logoBottomY = y;
  if (company.logo) {
    try {
      const img = new Image();
      img.src = company.logo;
      await new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      const maxW = 55;
      const maxH = 28;
      let w = maxW,
        h = maxH;

      if (img.naturalWidth && img.naturalHeight) {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (ratio > maxW / maxH) {
          w = maxW;
          h = maxW / ratio;
        } else {
          h = maxH;
          w = maxH * ratio;
        }
      }

      doc.addImage(company.logo, "AUTO", margin, y, w, h, undefined, "FAST");
      logoBottomY = y + h + 5;
    } catch (e) {
      console.warn("Logo failed:", e);
      // Fallback: blue square placeholder
      doc.setFillColor(...hexToRgb(c.blue));
      doc.roundedRect(margin, y, 16, 16, 2, 2, "F");
      logoBottomY = y + 20;
    }
  } else {
    // No logo: blue square placeholder
    doc.setFillColor(...hexToRgb(c.blue));
    doc.roundedRect(margin, y, 16, 16, 2, 2, "F");
    logoBottomY = y + 20;
  }

  // Company name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(company.name || "Your Company", margin, logoBottomY);

  // Company email
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text(company.email || "email@example.com", margin, logoBottomY + 5);

  // Company address
  doc.text(company.address || "Address", margin, logoBottomY + 10);

  y = logoBottomY + 18;

  // ============================================================
  // DIVIDER
  // ============================================================
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.4);
  doc.line(margin, y, rightEdge, y);
  y += 10;

  // ============================================================
  // BILL TO & DATES - Two columns
  // ============================================================
  const col2Start = pageWidth / 2 + 5;
  const billToStartY = y;

  // Left column: BILL TO
  // User icon (circle)
  doc.setFillColor(...hexToRgb(c.textLight));
  doc.circle(margin + 2, y + 1, 1.5, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("BILL TO", margin + 6, y + 2);
  y += 7;

  // Client name
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(billTo?.name || "Client Name", margin, y);
  y += 5;

  // Client email
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text(billTo?.email || "client@example.com", margin, y);
  y += 4;

  // Client address
  doc.text(billTo?.address || "Client Address", margin, y);
  y += 4;

  // Client phone (if exists)
  if (billTo?.phone) {
    doc.text(billTo.phone, margin, y);
    y += 4;
  }

  // Right column: DATES
  let dateY = billToStartY + 4;

  // Issue Date row
  // Calendar icon (small circle)
  doc.setFillColor(...hexToRgb(c.textLight));
  doc.circle(col2Start + 2, dateY, 1.5, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Issue Date", col2Start + 6, dateY + 1);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    rightEdge,
    dateY + 1,
    { align: "right" }
  );

  dateY += 10;

  // Due Date row
  doc.setFillColor(...hexToRgb(c.textLight));
  doc.circle(col2Start + 2, dateY, 1.5, "F");

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Due Date", col2Start + 6, dateY + 1);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(formatDate(invoice.due_date), rightEdge, dateY + 1, {
    align: "right",
  });

  y = Math.max(y, dateY + 5) + 8;

  // ============================================================
  // DIVIDER
  // ============================================================
  doc.setDrawColor(...hexToRgb(c.border));
  doc.line(margin, y, rightEdge, y);
  y += 8;

  // ============================================================
  // DESCRIPTION (if exists)
  // ============================================================
  if (invoice.description?.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.textMuted));
    const descLines = doc.splitTextToSize(invoice.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4 + 6;

    // Divider
    doc.setDrawColor(...hexToRgb(c.border));
    doc.line(margin, y, rightEdge, y);
    y += 8;
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================
  const colDesc = margin;
  const colQty = margin + contentWidth * 0.55;
  const colRate = margin + contentWidth * 0.72;
  const colAmount = rightEdge;

  // Table header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("DESCRIPTION", colDesc, y);
  doc.text("QTY", colQty, y, { align: "right" });
  doc.text("RATE", colRate, y, { align: "right" });
  doc.text("AMOUNT", colAmount, y, { align: "right" });

  y += 4;

  // Header border
  doc.setDrawColor(...hexToRgb(c.borderMedium));
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 6;

  // Table rows
  items.forEach((item, idx) => {
    // Description
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    const desc = (item.description || "—").substring(0, 45);
    doc.text(desc, colDesc, y);

    // Qty
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text(String(item.quantity || 0), colQty, y, { align: "right" });

    // Rate
    doc.text(formatMoney(item.unit_price || 0, currency), colRate, y, {
      align: "right",
    });

    // Amount (bold)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(formatMoney(item.amount || 0, currency), colAmount, y, {
      align: "right",
    });

    y += 8;

    // Row border (except last)
    if (idx < items.length - 1) {
      doc.setDrawColor(...hexToRgb(c.border));
      doc.setLineWidth(0.2);
      doc.line(margin, y - 3, rightEdge, y - 3);
    }
  });

  // Bottom border after items
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.2);
  doc.line(margin, y, rightEdge, y);
  y += 12;

  // ============================================================
  // SUMMARY - Right aligned, 65mm wide
  // ============================================================
  const summaryWidth = 65;
  const summaryLeft = rightEdge - summaryWidth;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Subtotal", summaryLeft, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(formatMoney(invoice.subtotal || 0, currency), rightEdge, y, {
    align: "right",
  });
  y += 6;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("Discount", summaryLeft, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.green));
    doc.text(`-${invoice.discount}%`, rightEdge, y, { align: "right" });
    y += 6;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("Shipping", summaryLeft, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(
      formatMoney(parseFloat(String(invoice.shipping)), currency),
      rightEdge,
      y,
      { align: "right" }
    );
    y += 6;
  }

  // Divider before total
  y += 2;
  doc.setDrawColor(...hexToRgb(c.borderMedium));
  doc.setLineWidth(0.3);
  doc.line(summaryLeft, y, rightEdge, y);
  y += 8;

  // TOTAL
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("Total", summaryLeft, y);
  doc.setTextColor(...hexToRgb(c.blue));
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    rightEdge,
    y,
    { align: "right" }
  );

  y += 18;

  // ============================================================
  // NOTES (if exists)
  // ============================================================
  if (invoice.notes?.trim()) {
    // Notes background box
    doc.setFillColor(...hexToRgb(c.notesBg));
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth - 10);
    const notesHeight = Math.max(20, notesLines.length * 4 + 14);
    doc.roundedRect(margin, y, contentWidth, notesHeight, 3, 3, "F");

    // Notes label
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("NOTES", margin + 5, y + 6);

    // Notes content
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.textLight));
    doc.text(notesLines, margin + 5, y + 12);
  }

  // ============================================================
  // SAVE
  // ============================================================
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
