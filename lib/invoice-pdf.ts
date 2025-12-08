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

// Theme colors - optimized for clean professional PDFs
const COLORS = {
  dark: {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    border: "#334155",
    accent: "#3b82f6",
    tableHeader: "#334155",
  },
  light: {
    bg: "#ffffff",
    cardBg: "#ffffff",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    accent: "#3b82f6",
    tableHeader: "#f9fafb",
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
  const pdfSymbols: Record<string, string> = {
    GBP: "£ ",
    EUR: "€ ",
    USD: "$ ",
    CAD: "CA$ ",
    AUD: "A$ ",
  };
  return pdfSymbols[code] || code + " ";
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
  // Always use light theme for PDFs - better for printing and professional look
  const c = COLORS.light;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const rightEdge = pageWidth - margin;
  const contentWidth = pageWidth - margin * 2;
  const halfWidth = contentWidth / 2 - 5;

  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  // White background for clean professional look
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  let y = margin;

  // ============================================================
  // HEADER: Company name (left) | INVOICE title (right)
  // ============================================================
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(company.name || "Company Name", margin, y);

  doc.setFontSize(28);
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("INVOICE", rightEdge, y, { align: "right" });

  y += 8;

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
  // INVOICE DETAILS BOX (right side) - clean with border
  // ============================================================
  const detailsBoxX = margin + halfWidth + 10;
  const detailsBoxY = margin + 14;
  const detailsBoxW = halfWidth;
  const detailsBoxH = 30;

  // Light background with border
  doc.setFillColor(...hexToRgb(c.tableHeader));
  doc.roundedRect(
    detailsBoxX,
    detailsBoxY,
    detailsBoxW,
    detailsBoxH,
    3,
    3,
    "F"
  );
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(
    detailsBoxX,
    detailsBoxY,
    detailsBoxW,
    detailsBoxH,
    3,
    3,
    "S"
  );

  let detY = detailsBoxY + 8;
  doc.setFontSize(9);

  // Invoice #
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Invoice #", detailsBoxX + 6, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    invoice.invoice_number || "INV0001",
    detailsBoxX + detailsBoxW - 6,
    detY,
    { align: "right" }
  );
  detY += 7;

  // Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Date", detailsBoxX + 6, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    detailsBoxX + detailsBoxW - 6,
    detY,
    { align: "right" }
  );
  detY += 7;

  // Due Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Due Date", detailsBoxX + 6, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(formatDate(invoice.due_date), detailsBoxX + detailsBoxW - 6, detY, {
    align: "right",
  });

  y = Math.max(y, detailsBoxY + detailsBoxH) + 8;

  // ============================================================
  // DIVIDER LINE
  // ============================================================
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 12;

  // ============================================================
  // BILL TO
  // ============================================================
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("BILL TO", margin, y);
  y += 6;

  // Parse address into lines
  const addressLines = billTo?.address
    ? billTo.address
        .split(/[,\n]/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  // Calculate card height - generous spacing
  const billCardH = 24 + addressLines.length * 5 + (billTo?.email ? 5 : 0);

  // Card background
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(margin, y, contentWidth, billCardH, 3, 3, "F");

  // Card border
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, billCardH, 3, 3, "S");

  // Content
  let billY = y + 10;

  // Client name - larger and bold
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(billTo?.name || "Client Name", margin + 10, billY);
  billY += 7;

  // Address lines with proper spacing
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));

  addressLines.forEach((line) => {
    doc.text(line, margin + 10, billY);
    billY += 5;
  });

  // Email
  if (billTo?.email) {
    doc.text(billTo.email, margin + 10, billY);
  }

  y += billCardH + 12;

  // ============================================================
  // DESCRIPTION (if exists)
  // ============================================================
  if (invoice.description?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("DESCRIPTION", margin, y);
    y += 6;

    const descLines = doc.splitTextToSize(
      invoice.description,
      contentWidth - 20
    );
    const descCardH = Math.max(18, descLines.length * 5 + 12);

    // Card background only - no border, no accent
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, contentWidth, descCardH, 3, 3, "F");

    // Border
    doc.setDrawColor(...hexToRgb(c.border));
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, descCardH, 3, 3, "S");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(descLines, margin + 10, y + 11);

    y += descCardH + 10;
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  // Table header - light gray background
  const tableHeaderH = 10;
  doc.setFillColor(...hexToRgb(c.tableHeader));
  doc.roundedRect(margin, y, contentWidth, tableHeaderH, 2, 2, "F");

  const colDesc = margin + 8;
  const colQty = margin + contentWidth * 0.48;
  const colPrice = margin + contentWidth * 0.62;
  const colTax = margin + contentWidth * 0.76;
  const colAmount = rightEdge - 8;

  // Header text - dark gray for readability
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("DESCRIPTION", colDesc, y + 6.5);
  doc.text("QTY", colQty, y + 6.5, { align: "center" });
  doc.text("UNIT PRICE", colPrice, y + 6.5, { align: "center" });
  doc.text("TAX", colTax, y + 6.5, { align: "center" });
  doc.text("AMOUNT", colAmount, y + 6.5, { align: "right" });

  y += tableHeaderH;

  // Table body background
  const tableBodyStartY = y;

  // Table rows
  items.forEach((item, index) => {
    y += 10;

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
  });

  y += 8;

  // Table border around body
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(
    margin,
    tableBodyStartY,
    contentWidth,
    y - tableBodyStartY,
    2,
    2,
    "S"
  );

  y += 15;

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
    y += 6;

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

    const bankCardH = Math.max(22, bankLines.length * 5 + 12);
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, halfWidth, bankCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));

    let bankTextY = y + 10;
    bankLines.slice(0, 4).forEach((line) => {
      doc.text(line.substring(0, 40), margin + 8, bankTextY);
      bankTextY += 5;
    });
  }

  // INVOICE SUMMARY (right side)
  const summaryX = margin + halfWidth + 10;
  const summaryW = halfWidth;
  const summaryH = 40;

  // Summary box with light gray background
  doc.setFillColor(...hexToRgb(c.tableHeader));
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryH, 3, 3, "F");

  // Border
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryH, 3, 3, "S");

  // Subtotal
  let sumY = summaryStartY + 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Subtotal", summaryX + 8, sumY);
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatMoney(invoice.subtotal || 0, currency),
    summaryX + summaryW - 8,
    sumY,
    { align: "right" }
  );

  // Line
  sumY += 5;
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.2);
  doc.line(summaryX + 8, sumY, summaryX + summaryW - 8, sumY);

  // Total - blue color for emphasis
  sumY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("Total", summaryX + 8, sumY);
  doc.setTextColor(...hexToRgb(c.accent)); // Blue for total amount
  doc.text(
    formatMoney(parseFloat(String(invoice.total)) || 0, currency),
    summaryX + summaryW - 8,
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
    y += 6;

    const notesCardH = 20;
    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, halfWidth, notesCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(invoice.notes.substring(0, 60), margin + 8, y + 12);
  }

  // ============================================================
  // SAVE
  // ============================================================
  doc.save(`Invoice-${invoice.invoice_number || invoice.id}.pdf`);
}
