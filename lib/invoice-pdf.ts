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

interface ThemeColors {
  background: string;
  cardBg: string;
  text: string;
  textMuted: string;
  textLight: string;
  border: string;
  borderLight: string;
  accent: string;
  accentBg: string;
}

function getColors(theme: PDFTheme): ThemeColors {
  if (theme === "dark") {
    return {
      background: "#020617", // slate-950
      cardBg: "#0f172a", // slate-900
      text: "#f8fafc", // slate-50
      textMuted: "#94a3b8", // slate-400
      textLight: "#cbd5e1", // slate-300
      border: "#1e293b", // slate-800
      borderLight: "#334155", // slate-700
      accent: "#3b82f6", // blue-500
      accentBg: "#1e3a5f", // blue-900/40
    };
  }
  return {
    background: "#ffffff",
    cardBg: "#ffffff",
    text: "#0f172a", // slate-900
    textMuted: "#64748b", // slate-500
    textLight: "#94a3b8", // slate-400
    border: "#f1f5f9", // slate-100
    borderLight: "#e2e8f0", // slate-200
    accent: "#3b82f6", // blue-500
    accentBg: "#dbeafe", // blue-100
  };
}

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

// Currency symbols that work in Helvetica
function getCurrencySymbol(currency: string): string {
  const code = currency.toUpperCase();
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
    // These don't render well in PDF, use code
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
  };
  return symbols[code] || code + " ";
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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  const colors = getColors(theme);
  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  // ========== PAGE BACKGROUND ==========
  doc.setFillColor(...hexToRgb(colors.background));
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ========== MAIN CARD ==========
  const cardX = margin - 5;
  const cardY = margin - 5;
  const cardWidth = contentWidth + 10;
  const cardHeight = pageHeight - margin * 2 + 10;

  doc.setFillColor(...hexToRgb(colors.cardBg));
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, "F");

  // Card border
  doc.setDrawColor(...hexToRgb(colors.borderLight));
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, "S");

  let y = margin + 5;

  // ========== HEADER SECTION ==========
  // Logo (left side)
  let logoHeight = 0;
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

      const maxW = 50;
      const maxH = 25;
      let w = maxW;
      let h = maxH;

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
      logoHeight = h;
    } catch (e) {
      console.warn("Logo failed:", e);
    }
  }

  // Invoice badge + INVOICE title (right side)
  const invoiceNum = invoice.invoice_number || "INV0001";

  // Badge background
  doc.setFillColor(...hexToRgb(colors.accentBg));
  const badgeText = invoiceNum;
  doc.setFontSize(9);
  const badgeWidth = doc.getTextWidth(badgeText) + 14;
  doc.roundedRect(pageWidth - margin - badgeWidth, y, badgeWidth, 7, 3, 3, "F");

  // Badge text
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.accent));
  doc.text(badgeText, pageWidth - margin - badgeWidth / 2, y + 5, {
    align: "center",
  });

  // INVOICE title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text("INVOICE", pageWidth - margin, y + 18, { align: "right" });

  // Company info below logo
  y += Math.max(logoHeight + 8, 25);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text(company.name || "Company Name", margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));

  if (company.email) {
    doc.text(company.email, margin, y);
    y += 4;
  }
  if (company.address) {
    doc.text(company.address, margin, y);
    y += 4;
  }

  y += 8;

  // ========== SECTION DIVIDER ==========
  doc.setDrawColor(...hexToRgb(colors.border));
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ========== BILL TO & DATES (Two columns) ==========
  const col1X = margin;
  const col2X = pageWidth / 2 + 10;
  const billToStartY = y;

  // BILL TO header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("BILL TO", col1X, y);

  // Client name
  y += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text(billTo?.name || "Client Name", col1X, y);

  // Client details
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));

  if (billTo?.email) {
    doc.text(billTo.email, col1X, y);
    y += 4;
  }
  if (billTo?.address) {
    doc.text(billTo.address, col1X, y);
    y += 4;
  }
  if (billTo?.phone) {
    doc.text(billTo.phone, col1X, y);
    y += 4;
  }

  // DATES (right column) - positioned at same level as BILL TO
  let dateY = billToStartY + 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Issue Date row
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Issue Date", col2X, dateY);
  doc.setTextColor(...hexToRgb(colors.text));
  doc.setFont("helvetica", "bold");
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    pageWidth - margin,
    dateY,
    { align: "right" }
  );

  dateY += 7;

  // Due Date row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Due Date", col2X, dateY);
  doc.setTextColor(...hexToRgb(colors.text));
  doc.setFont("helvetica", "bold");
  doc.text(formatDate(invoice.due_date), pageWidth - margin, dateY, {
    align: "right",
  });

  y = Math.max(y, dateY) + 12;

  // ========== SECTION DIVIDER ==========
  doc.setDrawColor(...hexToRgb(colors.border));
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ========== DESCRIPTION (if exists) ==========
  if (invoice.description?.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.textLight));
    const descLines = doc.splitTextToSize(invoice.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4 + 8;

    // Divider
    doc.setDrawColor(...hexToRgb(colors.border));
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  }

  // ========== ITEMS TABLE ==========
  // Table header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.textMuted));

  const colDesc = margin;
  const colQty = margin + contentWidth * 0.55;
  const colRate = margin + contentWidth * 0.7;
  const colAmount = pageWidth - margin;

  doc.text("DESCRIPTION", colDesc, y);
  doc.text("QTY", colQty, y, { align: "right" });
  doc.text("RATE", colRate, y, { align: "right" });
  doc.text("AMOUNT", colAmount, y, { align: "right" });

  y += 4;

  // Header underline
  doc.setDrawColor(...hexToRgb(colors.borderLight));
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Table rows
  items.forEach((item) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.text));
    doc.text((item.description || "—").substring(0, 40), colDesc, y);

    doc.setTextColor(...hexToRgb(colors.textLight));
    doc.text(String(item.quantity || 0), colQty, y, { align: "right" });
    doc.text(formatMoney(item.unit_price || 0, currency), colRate, y, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.text));
    doc.text(formatMoney(item.amount || 0, currency), colAmount, y, {
      align: "right",
    });

    y += 8;

    // Row separator
    doc.setDrawColor(...hexToRgb(colors.border));
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
  });

  y += 10;

  // ========== SUMMARY (right aligned) ==========
  const summaryWidth = 70;
  const summaryX = pageWidth - margin - summaryWidth;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Subtotal", summaryX, y);
  doc.setTextColor(...hexToRgb(colors.text));
  doc.setFont("helvetica", "bold");
  doc.text(
    formatMoney(invoice.subtotal || 0, currency),
    pageWidth - margin,
    y,
    {
      align: "right",
    }
  );
  y += 7;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("Discount", summaryX, y);
    doc.setTextColor(34, 197, 94); // green
    doc.setFont("helvetica", "bold");
    doc.text(`-${invoice.discount}%`, pageWidth - margin, y, {
      align: "right",
    });
    y += 7;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("Shipping", summaryX, y);
    doc.setTextColor(...hexToRgb(colors.text));
    doc.setFont("helvetica", "bold");
    doc.text(
      formatMoney(parseFloat(String(invoice.shipping)), currency),
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 7;
  }

  // Divider before total
  y += 2;
  doc.setDrawColor(...hexToRgb(colors.borderLight));
  doc.setLineWidth(0.3);
  doc.line(summaryX, y, pageWidth - margin, y);
  y += 8;

  // TOTAL
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text("Total", summaryX, y);
  doc.setTextColor(...hexToRgb(colors.accent));
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 20;

  // ========== NOTES ==========
  if (invoice.notes?.trim()) {
    // Notes box
    doc.setFillColor(...hexToRgb(theme === "dark" ? "#1e293b" : "#f8fafc"));
    const notesHeight = 25;
    doc.roundedRect(margin, y, contentWidth, notesHeight, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("NOTES", margin + 5, y + 6);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.textLight));
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 10);
    doc.text(noteLines.slice(0, 2), margin + 5, y + 12);
  }

  // ========== SAVE ==========
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
