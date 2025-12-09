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

// Theme colors - exactly matching InvoicePreview.tsx
const THEMES = {
  light: {
    // Background colors
    pageBg: [255, 255, 255] as [number, number, number], // white
    cardBg: [255, 255, 255] as [number, number, number], // white
    notesBg: [248, 250, 252] as [number, number, number], // slate-50

    // Text colors
    text: [15, 23, 42] as [number, number, number], // slate-900
    textMuted: [100, 116, 139] as [number, number, number], // slate-500
    textSecondary: [71, 85, 105] as [number, number, number], // slate-600

    // Border colors
    borderLight: [243, 244, 246] as [number, number, number], // gray-100
    borderMedium: [229, 231, 235] as [number, number, number], // gray-200
    borderTable: [226, 232, 240] as [number, number, number], // slate-200

    // Accent colors
    accent: [59, 130, 246] as [number, number, number], // blue-500
    accentLight: [37, 99, 235] as [number, number, number], // blue-600
    accentBg: [219, 234, 254] as [number, number, number], // blue-100

    // Status colors
    green: [22, 163, 74] as [number, number, number], // green-600

    // Logo placeholder gradient
    logoGradientFrom: [59, 130, 246] as [number, number, number], // blue-500
    logoGradientTo: [37, 99, 235] as [number, number, number], // blue-600
  },
  dark: {
    // Background colors
    pageBg: [2, 6, 23] as [number, number, number], // slate-950
    cardBg: [2, 6, 23] as [number, number, number], // slate-950
    notesBg: [30, 41, 59] as [number, number, number], // slate-800/50

    // Text colors
    text: [255, 255, 255] as [number, number, number], // white
    textMuted: [148, 163, 184] as [number, number, number], // slate-400
    textSecondary: [203, 213, 225] as [number, number, number], // slate-300

    // Border colors
    borderLight: [30, 41, 59] as [number, number, number], // slate-800
    borderMedium: [30, 41, 59] as [number, number, number], // slate-800
    borderTable: [51, 65, 85] as [number, number, number], // slate-700

    // Accent colors
    accent: [96, 165, 250] as [number, number, number], // blue-400
    accentLight: [96, 165, 250] as [number, number, number], // blue-400
    accentBg: [30, 58, 138] as [number, number, number], // blue-900/40

    // Status colors
    green: [74, 222, 128] as [number, number, number], // green-400

    // Logo placeholder gradient
    logoGradientFrom: [59, 130, 246] as [number, number, number], // blue-500
    logoGradientTo: [37, 99, 235] as [number, number, number], // blue-600
  },
};

function getCurrencySymbol(currency: string): string {
  const code = currency.toUpperCase();
  const symbols: Record<string, string> = {
    GBP: "£",
    EUR: "€",
    USD: "$",
    CAD: "CA$",
    AUD: "A$",
  };
  return symbols[code] || code + " ";
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
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
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
  // Force light theme for printed invoices to avoid dark backgrounds in downloads
  const c = THEMES["light"];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const padding = 15; // p-6 equivalent (~24px = 6mm, but we use 15 for better PDF look)
  const margin = 15;
  const rightEdge = pageWidth - margin;
  const contentWidth = pageWidth - margin * 2;

  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items).filter((item) => item.description);
  const billTo = parseBillTo(invoice.bill_to);

  // ============================================================
  // PAGE BACKGROUND
  // ============================================================
  doc.setFillColor(...c.pageBg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  let y = margin;

  // ============================================================
  // SECTION 1: INVOICE HEADER (matches preview header section)
  // Border-bottom after this section
  // ============================================================
  const headerStartY = y;

  // LEFT SIDE: Logo + Company Info
  let logoEndY = y;

  // Try to add company logo
  if (company.logo) {
    try {
      const logoMaxWidth = 55;
      const logoMaxHeight = 25;
      doc.addImage(
        company.logo,
        "AUTO",
        margin,
        y,
        logoMaxWidth,
        logoMaxHeight,
        undefined,
        "FAST"
      );
      logoEndY = y + logoMaxHeight + 4;
    } catch (e) {
      console.warn("Failed to add logo to PDF:", e);
      // Draw placeholder: blue gradient square with building icon effect
      doc.setFillColor(...c.logoGradientFrom);
      doc.roundedRect(margin, y, 16, 16, 2, 2, "F");
      logoEndY = y + 20;
    }
  } else {
    // Draw placeholder: blue gradient square
    doc.setFillColor(...c.logoGradientFrom);
    doc.roundedRect(margin, y, 16, 16, 2, 2, "F");
    // White inner square (building icon placeholder)
    doc.setFillColor(255, 255, 255);
    doc.rect(margin + 4, y + 4, 8, 8, "F");
    logoEndY = y + 20;
  }

  // Company name - text-xl font-bold
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text(company.name || "Your Company", margin, logoEndY);

  // Company email - text-sm text-slate-500
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...c.textMuted);
  let companyY = logoEndY + 5;
  if (company.email) {
    doc.text(company.email, margin, companyY);
    companyY += 4;
  }

  // Company address - text-sm text-slate-500
  if (company.address) {
    const addrLines = company.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addrLines.forEach((line) => {
      doc.text(line, margin, companyY);
      companyY += 4;
    });
  }

  // RIGHT SIDE: Invoice badge + INVOICE title
  const invoiceNum = invoice.invoice_number || "INV0001";

  // Invoice number badge - inline-flex px-3 py-1 bg-blue-100 rounded-full
  doc.setFillColor(...c.accentBg);
  const badgeText = "# " + invoiceNum;
  doc.setFontSize(9);
  const badgeTextWidth = doc.getTextWidth(badgeText);
  const badgeWidth = badgeTextWidth + 10;
  const badgeX = rightEdge - badgeWidth;
  const badgeY = headerStartY;
  doc.roundedRect(badgeX, badgeY, badgeWidth, 7, 3, 3, "F");

  // Badge text - text-sm font-semibold text-blue-600
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.accentLight);
  doc.text(badgeText, badgeX + badgeWidth / 2, badgeY + 5, { align: "center" });

  // "INVOICE" title - text-2xl font-bold
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text("INVOICE", rightEdge, badgeY + 15, { align: "right" });

  // Move Y to after header content
  y = Math.max(companyY, badgeY + 20) + 6;

  // Border-bottom (border-gray-100 dark:border-slate-800)
  doc.setDrawColor(...c.borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 8;

  // ============================================================
  // SECTION 2: BILL TO & DATES (two column grid)
  // ============================================================
  const billToStartY = y;

  // LEFT COLUMN: Bill To
  // Label with icon - text-xs font-medium uppercase tracking-wider
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.textMuted);
  doc.text("BILL TO", margin, y);
  y += 5;

  // Client name - font-semibold text-slate-900
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text(billTo?.name || "Client Name", margin, y);
  y += 5;

  // Client email - text-sm text-slate-500
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...c.textMuted);
  if (billTo?.email) {
    doc.text(billTo.email, margin, y);
    y += 4;
  }

  // Client address
  if (billTo?.address) {
    const addrLines = billTo.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addrLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 4;
    });
  }

  // RIGHT COLUMN: Dates (starting from same Y as Bill To)
  const datesX = margin + contentWidth * 0.55;
  let datesY = billToStartY;

  // Invoice details card (rounded border)
  const detailsBoxX = datesX - 6;
  const detailsBoxY = billToStartY - 4;
  const detailsBoxW = rightEdge - detailsBoxX;
  const detailsBoxH = 26;
  doc.setFillColor(...c.borderMedium);
  doc.setDrawColor(...c.borderMedium);
  doc.setLineWidth(0.5);
  doc.roundedRect(
    detailsBoxX,
    detailsBoxY,
    detailsBoxW,
    detailsBoxH,
    3,
    3,
    "FD"
  );
  // Divider lines inside the card (slightly lighter)
  doc.setDrawColor(...c.borderTable);
  doc.line(detailsBoxX + 6, billToStartY + 6, rightEdge - 6, billToStartY + 6);
  doc.line(
    detailsBoxX + 6,
    billToStartY + 13,
    rightEdge - 6,
    billToStartY + 13
  );

  // Issue Date row
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...c.textMuted);
  doc.text("Issue Date", datesX, datesY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    rightEdge,
    datesY,
    { align: "right" }
  );

  datesY += 7;

  // Due Date row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...c.textMuted);
  doc.text("Due Date", datesX, datesY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text(formatDate(invoice.due_date), rightEdge, datesY, { align: "right" });

  y = Math.max(y, datesY) + 8;

  // Border-bottom
  doc.setDrawColor(...c.borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 8;

  // ============================================================
  // SECTION 3: DESCRIPTION (if present)
  // ============================================================
  if (invoice.description?.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...c.textSecondary);
    const descLines = doc.splitTextToSize(invoice.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4 + 6;

    // Border-bottom
    doc.setDrawColor(...c.borderLight);
    doc.setLineWidth(0.3);
    doc.line(margin, y, rightEdge, y);
    y += 8;
  }

  // ============================================================
  // SECTION 4: ITEMS TABLE
  // ============================================================

  // Column positions
  const colDesc = margin;
  const colQty = margin + contentWidth * 0.6;
  const colRate = margin + contentWidth * 0.78;
  const colAmount = rightEdge;

  // Table header with light fill matching border color
  const headerTop = y - 5;
  const headerHeight = 12;
  doc.setFillColor(...c.borderMedium);
  doc.rect(margin, headerTop, contentWidth, headerHeight, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.textSecondary);
  const headerTextY = headerTop + 8;
  doc.text("DESCRIPTION", colDesc, headerTextY);
  doc.text("QTY", colQty, headerTextY, { align: "right" });
  doc.text("RATE", colRate, headerTextY, { align: "right" });
  doc.text("AMOUNT", colAmount, headerTextY, { align: "right" });

  y = headerTop + headerHeight;

  // Header border (border-gray-200 dark:border-slate-700)
  doc.setDrawColor(...c.borderTable);
  doc.setLineWidth(0.4);
  doc.line(margin, y, rightEdge, y);
  y += 8;

  // Table rows
  items.forEach((item, index) => {
    // Description - text-sm text-slate-900
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...c.text);
    const descText = (item.description || "—").substring(0, 50);
    doc.text(descText, colDesc, y);

    // Qty - text-sm text-slate-600 text-right
    doc.setTextColor(...c.textSecondary);
    doc.text(String(item.quantity || 0), colQty, y, { align: "right" });

    // Rate - text-sm text-slate-600 text-right
    doc.text(formatMoney(item.unit_price || 0, currency), colRate, y, {
      align: "right",
    });

    // Amount - text-sm font-medium text-slate-900 text-right
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...c.text);
    doc.text(formatMoney(item.amount || 0, currency), colAmount, y, {
      align: "right",
    });

    y += 8;

    // Row border (border-gray-100 dark:border-slate-800) - except last row
    if (index < items.length - 1) {
      doc.setDrawColor(...c.borderLight);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 3, rightEdge, y - 3);
    }
  });

  // If no items
  if (items.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...c.textMuted);
    doc.text("No items added yet", margin + contentWidth / 2, y, {
      align: "center",
    });
    y += 10;
  }

  y += 4;

  // Border-bottom after table
  doc.setDrawColor(...c.borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 8;

  // ============================================================
  // SECTION 5: SUMMARY (right-aligned, w-64 equivalent)
  // ============================================================
  const summaryWidth = 65; // ~256px / 4 = 64mm but adjusted for PDF
  const summaryX = rightEdge - summaryWidth;

  // Subtotal row - text-sm
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...c.textMuted);
  doc.text("Subtotal", summaryX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text(formatMoney(invoice.subtotal || 0, currency), rightEdge, y, {
    align: "right",
  });
  y += 5;

  // Discount row (if > 0) - text-green-600
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...c.textMuted);
    doc.text("Discount", summaryX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...c.green);
    doc.text(
      "-" + formatMoney(parseFloat(String(invoice.discount)), currency),
      rightEdge,
      y,
      { align: "right" }
    );
    y += 5;
  }

  // Shipping row (if > 0)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...c.textMuted);
    doc.text("Shipping", summaryX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...c.text);
    doc.text(
      formatMoney(parseFloat(String(invoice.shipping)), currency),
      rightEdge,
      y,
      { align: "right" }
    );
    y += 5;
  }

  // Total separator (border-t border-gray-200)
  y += 2;
  doc.setDrawColor(...c.borderMedium);
  doc.setLineWidth(0.4);
  doc.line(summaryX, y, rightEdge, y);
  y += 6;

  // TOTAL row - text-lg font-bold, blue color for amount
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...c.text);
  doc.text("Total", summaryX, y);
  doc.setTextColor(...c.accent);
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    rightEdge,
    y,
    { align: "right" }
  );

  y += 15;

  // ============================================================
  // SECTION 6: BANK DETAILS (if present)
  // ============================================================
  if (invoice.bank_details) {
    let bankData: Record<string, string> | null = null;
    try {
      if (typeof invoice.bank_details === "string") {
        bankData = JSON.parse(invoice.bank_details);
      } else if (typeof invoice.bank_details === "object") {
        bankData = invoice.bank_details as Record<string, string>;
      }
    } catch {}

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...c.textMuted);
    doc.text("PAYMENT DETAILS", margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    if (bankData && Object.keys(bankData).length > 0) {
      Object.entries(bankData).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/[_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/(^|\s)\w/g, (m) => m.toUpperCase());
          doc.setTextColor(...c.textMuted);
          doc.text(`${label}:`, margin, y);
          doc.setTextColor(...c.text);
          doc.text(String(value), margin + 30, y);
          y += 4;
        }
      });
    } else if (
      typeof invoice.bank_details === "string" &&
      invoice.bank_details.trim()
    ) {
      doc.setTextColor(...c.text);
      const bankLines = invoice.bank_details
        .split(/[\n,]/)
        .map((l) => l.trim())
        .filter(Boolean);
      bankLines.forEach((line) => {
        doc.text(line, margin, y);
        y += 4;
      });
    }
    y += 6;
  }

  // ============================================================
  // SECTION 7: NOTES (in gray box like preview)
  // ============================================================
  if (invoice.notes?.trim()) {
    // Notes box background (bg-slate-50 dark:bg-slate-800/50)
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth - 12);
    const notesBoxHeight = Math.max(18, notesLines.length * 4 + 14);

    doc.setFillColor(...c.notesBg);
    doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 2, 2, "F");

    // Notes label - text-xs font-medium uppercase
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...c.textMuted);
    doc.text("NOTES", margin + 5, y + 6);

    // Notes content - text-sm text-slate-600
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...c.textSecondary);
    doc.text(notesLines, margin + 5, y + 12);
  }

  // ============================================================
  // SAVE PDF
  // ============================================================
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
