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
  border: string;
  accent: string;
  accentLight: string;
}

function getColors(theme: PDFTheme): ThemeColors {
  if (theme === "dark") {
    return {
      background: "#0f172a", // slate-900
      cardBg: "#1e293b", // slate-800
      text: "#f8fafc", // slate-50
      textMuted: "#94a3b8", // slate-400
      border: "#334155", // slate-700
      accent: "#3b82f6", // blue-500
      accentLight: "#1e3a5f", // blue-900/50
    };
  }
  return {
    background: "#ffffff",
    cardBg: "#ffffff",
    text: "#0f172a", // slate-900
    textMuted: "#64748b", // slate-500
    border: "#e2e8f0", // slate-200
    accent: "#3b82f6", // blue-500
    accentLight: "#eff6ff", // blue-50
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

// Currency display - use text codes for problematic symbols
function getCurrencyDisplay(currency: string): string {
  const code = currency.toUpperCase();
  const symbols: Record<string, string> = {
    USD: "$",
    CAD: "CA$",
    AUD: "A$",
    NZD: "NZ$",
    HKD: "HK$",
    SGD: "S$",
    MXN: "MX$",
    // These symbols don't work in Helvetica, use text
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
    BRL: "R$",
    ZAR: "R",
    AED: "AED ",
    SAR: "SAR ",
  };
  return symbols[code] || code + " ";
}

function formatMoney(amount: number, currency: string): string {
  const symbol = getCurrencyDisplay(currency);
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
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const colors = getColors(theme);
  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  // ========== BACKGROUND ==========
  doc.setFillColor(...hexToRgb(colors.background));
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  let y = margin;

  // ========== HEADER SECTION ==========

  // Company logo (if exists) - preserve aspect ratio
  let logoEndY = y;
  if (company.logo) {
    try {
      // Load image to get dimensions
      const img = new Image();
      img.src = company.logo;

      // Wait for image to load (for dimension calculation)
      await new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      // Calculate dimensions preserving aspect ratio
      const maxWidth = 40; // Max logo width in mm
      const maxHeight = 12; // Max logo height in mm

      let logoWidth = maxWidth;
      let logoHeight = maxHeight;

      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        // Fit within max dimensions while preserving aspect ratio
        if (aspectRatio > maxWidth / maxHeight) {
          // Image is wider - constrain by width
          logoWidth = maxWidth;
          logoHeight = maxWidth / aspectRatio;
        } else {
          // Image is taller - constrain by height
          logoHeight = maxHeight;
          logoWidth = maxHeight * aspectRatio;
        }
      }

      doc.addImage(
        company.logo,
        "AUTO",
        margin,
        y,
        logoWidth,
        logoHeight,
        undefined,
        "FAST"
      );
      logoEndY = y + logoHeight + 4;
    } catch (e) {
      console.warn("Failed to add logo to PDF:", e);
    }
  }

  // INVOICE title (right) - at top
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.accent));
  doc.text("INVOICE", pageWidth - margin, y + 8, { align: "right" });

  // Invoice number badge (right)
  const invoiceNum = invoice.invoice_number || "INV0001";
  doc.setFillColor(...hexToRgb(colors.accentLight));
  const badgeWidth = doc.getTextWidth(invoiceNum) + 12;
  doc.roundedRect(
    pageWidth - margin - badgeWidth,
    y + 14,
    badgeWidth,
    8,
    2,
    2,
    "F"
  );
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.accent));
  doc.text(invoiceNum, pageWidth - margin - badgeWidth / 2, y + 19, {
    align: "center",
  });

  // Company name (left) - below logo if exists
  const companyNameY = company.logo ? logoEndY : y;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text(company.name || "Company Name", margin, companyNameY + 6);

  y = companyNameY + 12;

  // Company details (left)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));

  let companyY = y;
  if (company.address) {
    const lines = company.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    lines.forEach((line) => {
      doc.text(line, margin, companyY);
      companyY += 4;
    });
  }
  if (company.email) {
    doc.text(company.email, margin, companyY);
    companyY += 4;
  }
  if (company.phone) {
    doc.text(company.phone, margin, companyY);
    companyY += 4;
  }
  if (company.vat) {
    const taxLabel = company.tax_label || "VAT";
    doc.text(`${taxLabel}: ${company.vat}`, margin, companyY);
    companyY += 4;
  }

  y = Math.max(companyY, y + 8) + 15;

  // ========== DIVIDER ==========
  doc.setDrawColor(...hexToRgb(colors.border));
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // ========== TWO COLUMN: BILL TO & DATES ==========
  const colWidth = contentWidth / 2;

  // Bill To (left column)
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("BILL TO", margin, y);

  // Dates (right column)
  doc.text("INVOICE DETAILS", margin + colWidth, y);

  y += 6;

  // Bill To content
  let billY = y;
  if (billTo?.name) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.text));
    doc.text(billTo.name, margin, billY);
    billY += 6;
  }
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  if (billTo?.address) {
    const lines = doc.splitTextToSize(billTo.address, colWidth - 10);
    doc.text(lines, margin, billY);
    billY += lines.length * 4;
  }
  if (billTo?.email) {
    doc.text(billTo.email, margin, billY);
    billY += 4;
  }
  if (billTo?.phone) {
    doc.text(billTo.phone, margin, billY);
    billY += 4;
  }

  // Dates content (right column)
  let dateY = y;
  const dateX = margin + colWidth;
  const valueX = pageWidth - margin;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Issue Date
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Issue Date:", dateX, dateY);
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    valueX,
    dateY,
    { align: "right" }
  );
  dateY += 6;

  // Due Date
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Due Date:", dateX, dateY);
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text(formatDate(invoice.due_date), valueX, dateY, { align: "right" });
  dateY += 6;

  // Status
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Status:", dateX, dateY);
  const status =
    (invoice.status || "draft").charAt(0).toUpperCase() +
    (invoice.status || "draft").slice(1);
  if (invoice.status === "paid") {
    doc.setTextColor(34, 197, 94);
  } else if (invoice.status === "overdue") {
    doc.setTextColor(239, 68, 68);
  } else {
    doc.setTextColor(234, 179, 8);
  }
  doc.setFont("helvetica", "bold");
  doc.text(status, valueX, dateY, { align: "right" });

  y = Math.max(billY, dateY) + 15;

  // ========== DESCRIPTION (if exists) ==========
  if (invoice.description?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("DESCRIPTION", margin, y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.text));
    const descLines = doc.splitTextToSize(invoice.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 10;
  }

  // ========== ITEMS TABLE ==========
  const colDesc = margin;
  const colQty = margin + contentWidth * 0.5;
  const colRate = margin + contentWidth * 0.65;
  const colTax = margin + contentWidth * 0.8;
  const colAmount = pageWidth - margin;

  // Table header
  doc.setFillColor(...hexToRgb(theme === "dark" ? colors.cardBg : "#f8fafc"));
  doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("DESCRIPTION", colDesc + 3, y + 2);
  doc.text("QTY", colQty, y + 2, { align: "right" });
  doc.text("RATE", colRate, y + 2, { align: "right" });
  doc.text("TAX", colTax, y + 2, { align: "right" });
  doc.text("AMOUNT", colAmount - 3, y + 2, { align: "right" });

  y += 12;

  // Table rows
  const rowHeight = 10;
  items.forEach((item, i) => {
    // Alternating row background for dark mode
    if (theme === "dark" && i % 2 === 0) {
      doc.setFillColor(...hexToRgb("#1e293b"));
      doc.rect(margin, y - 4, contentWidth, rowHeight, "F");
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.text));

    const desc = (item.description || "—").substring(0, 50);
    doc.text(desc, colDesc + 3, y + 2);

    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text(String(item.quantity || 0), colQty, y + 2, { align: "right" });
    doc.text(formatMoney(item.unit_price || 0, currency), colRate, y + 2, {
      align: "right",
    });
    doc.text(`${item.tax || 0}%`, colTax, y + 2, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.text));
    doc.text(formatMoney(item.amount || 0, currency), colAmount - 3, y + 2, {
      align: "right",
    });

    y += rowHeight;
  });

  y += 10;

  // ========== SUMMARY ==========
  const summaryX = margin + contentWidth * 0.6;
  const summaryWidth = contentWidth * 0.4;

  // Summary box
  doc.setFillColor(...hexToRgb(theme === "dark" ? colors.cardBg : "#f8fafc"));
  doc.roundedRect(summaryX, y - 5, summaryWidth, 50, 3, 3, "F");

  let sumY = y + 3;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(colors.textMuted));
  doc.text("Subtotal", summaryX + 5, sumY);
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text(
    formatMoney(invoice.subtotal || 0, currency),
    pageWidth - margin - 5,
    sumY,
    { align: "right" }
  );
  sumY += 8;

  // Discount
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("Discount", summaryX + 5, sumY);
    doc.setTextColor(34, 197, 94);
    doc.text(`-${invoice.discount}%`, pageWidth - margin - 5, sumY, {
      align: "right",
    });
    sumY += 8;
  }

  // Shipping
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("Shipping", summaryX + 5, sumY);
    doc.setTextColor(...hexToRgb(colors.text));
    doc.text(
      formatMoney(parseFloat(String(invoice.shipping)), currency),
      pageWidth - margin - 5,
      sumY,
      { align: "right" }
    );
    sumY += 8;
  }

  // Divider
  sumY += 2;
  doc.setDrawColor(...hexToRgb(colors.border));
  doc.line(summaryX + 5, sumY, pageWidth - margin - 5, sumY);
  sumY += 8;

  // Total
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(colors.text));
  doc.text("Total", summaryX + 5, sumY);
  doc.setTextColor(...hexToRgb(colors.accent));
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    pageWidth - margin - 5,
    sumY,
    { align: "right" }
  );

  y += 60;

  // ========== PAYMENT DETAILS ==========
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
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("PAYMENT DETAILS", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.text));

    if (bankData && Object.keys(bankData).length > 0) {
      Object.entries(bankData).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          doc.text(`${label}: ${value}`, margin, y);
          y += 5;
        }
      });
    } else if (typeof invoice.bank_details === "string") {
      invoice.bank_details
        .split(/[\n,]/)
        .filter(Boolean)
        .forEach((line) => {
          doc.text(line.trim(), margin, y);
          y += 5;
        });
    }
    y += 10;
  }

  // ========== NOTES ==========
  if (invoice.notes?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.textMuted));
    doc.text("NOTES", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(colors.text));
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(noteLines, margin, y);
  }

  // ========== SAVE ==========
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
