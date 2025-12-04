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
  pageBg: [number, number, number];
  headerBar: [number, number, number];
  primaryText: [number, number, number];
  secondaryText: [number, number, number];
  mutedText: [number, number, number];
  border: [number, number, number];
  tableHeader: [number, number, number];
  tableHeaderText: [number, number, number];
  accentText: [number, number, number];
}

function getThemeColors(theme: PDFTheme): ThemeColors {
  if (theme === "dark") {
    return {
      pageBg: [17, 24, 39], // #111827 - gray-900
      headerBar: [31, 41, 55], // #1f2937 - gray-800
      primaryText: [249, 250, 251], // #f9fafb - gray-50
      secondaryText: [229, 231, 235], // #e5e7eb - gray-200
      mutedText: [156, 163, 175], // #9ca3af - gray-400
      border: [55, 65, 81], // #374151 - gray-700
      tableHeader: [55, 65, 81], // #374151 - gray-700
      tableHeaderText: [255, 255, 255], // white
      accentText: [96, 165, 250], // #60a5fa - blue-400
    };
  }
  // Light theme (default)
  return {
    pageBg: [255, 255, 255], // white
    headerBar: [31, 41, 55], // #1f2937 - gray-800
    primaryText: [17, 24, 39], // #111827 - gray-900
    secondaryText: [55, 65, 81], // #374151 - gray-700
    mutedText: [107, 114, 128], // #6b7280 - gray-500
    border: [229, 231, 235], // #e5e7eb - gray-200
    tableHeader: [31, 41, 55], // #1f2937 - gray-800
    tableHeaderText: [255, 255, 255], // white
    accentText: [31, 41, 55], // #1f2937 - gray-800
  };
}

function formatCurrency(amount: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
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
    if (Array.isArray(items)) return items as InvoiceItemRow[];
    if (typeof items === "string") {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (items && typeof items === "object") {
      return Object.values(items) as InvoiceItemRow[];
    }
  } catch {
    // ignore
  }
  return [];
}

function parseBillTo(billTo: InvoiceListItem["bill_to"]): ParsedBillTo | null {
  try {
    if (!billTo) return null;
    if (typeof billTo === "string") {
      const parsed = JSON.parse(billTo);
      return parsed && typeof parsed === "object" ? parsed : null;
    }
    if (typeof billTo === "object") return billTo as ParsedBillTo;
  } catch {
    // ignore
  }
  return null;
}

export async function generateInvoicePDF(
  invoice: InvoiceListItem,
  company: BusinessType,
  theme: PDFTheme = "light"
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);

  // Get theme colors
  const colors = getThemeColors(theme);

  // ============================================
  // PAGE BACKGROUND (for dark theme)
  // ============================================
  if (theme === "dark") {
    doc.setFillColor(...colors.pageBg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }

  // ============================================
  // HEADER - Bar at top
  // ============================================
  doc.setFillColor(...colors.headerBar);
  doc.rect(0, 0, pageWidth, 8, "F");

  y = 22;

  // Company name - large and bold on the left
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text(company.name || "Company Name", margin, y);

  // INVOICE title on the right
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.accentText);
  doc.text("INVOICE", pageWidth - margin, y, { align: "right" });

  y += 6;

  // Company address details on the left
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);

  let companyY = y;
  if (company.address) {
    const addressLines = company.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addressLines.forEach((line) => {
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

  // Invoice details box on the right
  const detailsBoxX = pageWidth - margin - 65;
  const detailsBoxY = y - 2;
  const detailsBoxWidth = 65;
  const detailsBoxHeight = 32;

  // Draw border for invoice details box
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(
    detailsBoxX,
    detailsBoxY,
    detailsBoxWidth,
    detailsBoxHeight,
    2,
    2,
    "S"
  );

  // Invoice # row
  let detailY = detailsBoxY + 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.mutedText);
  doc.text("Invoice #", detailsBoxX + 4, detailY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text(
    invoice.invoice_number || "INV0001",
    detailsBoxX + detailsBoxWidth - 4,
    detailY,
    { align: "right" }
  );

  // Separator line
  detailY += 4;
  doc.setDrawColor(...colors.border);
  doc.line(
    detailsBoxX + 3,
    detailY,
    detailsBoxX + detailsBoxWidth - 3,
    detailY
  );

  // Date row
  detailY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.mutedText);
  doc.text("Date", detailsBoxX + 4, detailY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.primaryText);
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    detailsBoxX + detailsBoxWidth - 4,
    detailY,
    { align: "right" }
  );

  // Separator line
  detailY += 4;
  doc.line(
    detailsBoxX + 3,
    detailY,
    detailsBoxX + detailsBoxWidth - 3,
    detailY
  );

  // Due Date row
  detailY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.mutedText);
  doc.text("Due Date", detailsBoxX + 4, detailY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.primaryText);
  doc.text(
    formatDate(invoice.due_date),
    detailsBoxX + detailsBoxWidth - 4,
    detailY,
    { align: "right" }
  );

  y = Math.max(companyY + 12, detailsBoxY + detailsBoxHeight + 10);

  // ============================================
  // SEPARATOR LINE
  // ============================================
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ============================================
  // BILL TO SECTION - Bordered box like preview
  // ============================================
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.mutedText);
  doc.text("BILL TO", margin, y);
  y += 5;

  // Bill To bordered box
  const billToBoxHeight = 30;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, billToBoxHeight, 3, 3, "S");

  let billY = y + 7;
  if (billTo?.name) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryText);
    doc.text(billTo.name, margin + 6, billY);
    billY += 5;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);

  if (billTo?.address) {
    doc.text(billTo.address, margin + 6, billY);
    billY += 4;
  }
  if (billTo?.email) {
    doc.text(billTo.email, margin + 6, billY);
  }

  y += billToBoxHeight + 10;

  // ============================================
  // DESCRIPTION SECTION - Bordered box like preview
  // ============================================
  if (invoice.description && invoice.description.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.mutedText);
    doc.text("DESCRIPTION", margin, y);
    y += 5;

    const descLines = doc.splitTextToSize(
      invoice.description,
      contentWidth - 12
    );
    const descBoxHeight = Math.max(15, 8 + descLines.length * 4);
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, y, contentWidth, descBoxHeight, 3, 3, "S");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.primaryText);
    doc.text(descLines, margin + 6, y + 7);

    y += descBoxHeight + 10;
  }

  // ============================================
  // ITEMS TABLE - Themed header with thick border
  // ============================================

  const tableStartY = y;
  const headerHeight = 14;
  const rowHeight = 14;
  const tableHeight = headerHeight + items.length * rowHeight;

  // Draw the outer border first (thick rounded rect)
  doc.setDrawColor(...colors.tableHeader);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin, y, contentWidth, tableHeight, 3, 3, "S");

  // Table header with themed background
  doc.setFillColor(...colors.tableHeader);
  doc.roundedRect(margin, y, contentWidth, headerHeight, 3, 3, "F");
  // Fill the bottom part of header to make it square at bottom
  doc.rect(margin, y + 6, contentWidth, headerHeight - 6, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.tableHeaderText);

  // Column positions - matching preview (DESCRIPTION, QTY, UNIT PRICE, TAX, AMOUNT)
  const colDesc = margin + 8;
  const colQty = margin + contentWidth * 0.4;
  const colPrice = margin + contentWidth * 0.54;
  const colTax = margin + contentWidth * 0.7;
  const colAmount = margin + contentWidth - 8;

  doc.text("DESCRIPTION", colDesc, y + 9);
  doc.text("QTY", colQty, y + 9, { align: "center" });
  doc.text("UNIT PRICE", colPrice, y + 9, { align: "center" });
  doc.text("TAX", colTax, y + 9, { align: "center" });
  doc.text("AMOUNT", colAmount, y + 9, { align: "right" });

  y += headerHeight;

  // Table rows
  items.forEach((item, index) => {
    const rowY = y + 10;

    // Description
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.primaryText);
    const descText = item.description || "—";
    doc.text(descText.substring(0, 45), colDesc, rowY);

    // Quantity - centered
    doc.setTextColor(...colors.mutedText);
    doc.text(String(item.quantity || 0), colQty, rowY, { align: "center" });

    // Unit Price
    doc.text(formatCurrency(item.unit_price || 0, currency), colPrice, rowY, {
      align: "center",
    });

    // Tax
    doc.text(`${item.tax || 0}%`, colTax, rowY, { align: "center" });

    // Amount - bold
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryText);
    doc.text(formatCurrency(item.amount || 0, currency), colAmount, rowY, {
      align: "right",
    });

    y += rowHeight;
  });

  y += 20;

  // ============================================
  // BANK DETAILS (LEFT) & INVOICE SUMMARY (RIGHT) - Two column layout
  // ============================================

  const leftColumnWidth = contentWidth * 0.45;
  const rightColumnWidth = contentWidth * 0.48;
  const rightColumnX = pageWidth - margin - rightColumnWidth;
  const summaryStartY = y;

  // Bank Details on the left (if present)
  let bankDetailsHeight = 0;
  if (invoice.bank_details) {
    let bankData: Record<string, string> | null = null;

    try {
      if (typeof invoice.bank_details === "string") {
        bankData = JSON.parse(invoice.bank_details);
      } else if (typeof invoice.bank_details === "object") {
        bankData = invoice.bank_details as Record<string, string>;
      }
    } catch {
      // treat as plain string
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.mutedText);
    doc.text("BANK DETAILS", margin, y);
    y += 5;

    // Bank details bordered box
    const bankBoxY = y;
    let bankContentY = y + 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    if (bankData && Object.keys(bankData).length > 0) {
      Object.entries(bankData).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/[_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/(^|\s)\w/g, (m) => m.toUpperCase());

          doc.setTextColor(...colors.mutedText);
          doc.text(`${label}:`, margin + 4, bankContentY);
          doc.setTextColor(...colors.primaryText);
          doc.text(String(value), margin + 35, bankContentY);
          bankContentY += 5;
        }
      });
    } else if (
      typeof invoice.bank_details === "string" &&
      invoice.bank_details.trim()
    ) {
      doc.setTextColor(...colors.mutedText);
      doc.text("No bank details provided", margin + 4, bankContentY);
      bankContentY += 5;
    }

    bankDetailsHeight = bankContentY - bankBoxY + 5;
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(
      margin,
      bankBoxY,
      leftColumnWidth,
      bankDetailsHeight,
      3,
      3,
      "S"
    );
  }

  // INVOICE SUMMARY on the right - themed header with rounded top corners
  const summaryBoxY = summaryStartY;
  const summaryHeaderHeight = 14;

  // Draw header with themed background
  doc.setFillColor(...colors.tableHeader);
  // Draw header with only top corners rounded
  doc.roundedRect(
    rightColumnX,
    summaryBoxY,
    rightColumnWidth,
    summaryHeaderHeight,
    4,
    4,
    "F"
  );
  // Square off the bottom of header
  doc.rect(rightColumnX, summaryBoxY + 7, rightColumnWidth, 7, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.tableHeaderText);
  doc.text("INVOICE SUMMARY", rightColumnX + 10, summaryBoxY + 10);

  // Summary content area
  let summaryY = summaryBoxY + summaryHeaderHeight + 12;
  const summaryContentX = rightColumnX + 12;
  const summaryValueX = rightColumnX + rightColumnWidth - 12;

  // Subtotal
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);
  doc.text("Subtotal", summaryContentX, summaryY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text(
    formatCurrency(invoice.subtotal || 0, currency),
    summaryValueX,
    summaryY,
    { align: "right" }
  );

  // Separator line
  summaryY += 4;
  doc.setDrawColor(...colors.border);
  doc.line(
    rightColumnX + 5,
    summaryY,
    rightColumnX + rightColumnWidth - 5,
    summaryY
  );
  summaryY += 6;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setTextColor(...colors.mutedText);
    doc.text("Discount", summaryContentX, summaryY);
    doc.setTextColor(239, 68, 68); // red for discount
    doc.text(
      `-${parseFloat(String(invoice.discount))}%`,
      summaryValueX,
      summaryY,
      { align: "right" }
    );
    summaryY += 4;
    doc.setDrawColor(...colors.border);
    doc.line(
      rightColumnX + 5,
      summaryY,
      rightColumnX + rightColumnWidth - 5,
      summaryY
    );
    summaryY += 6;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setTextColor(...colors.mutedText);
    doc.text("Shipping", summaryContentX, summaryY);
    doc.setTextColor(...colors.primaryText);
    doc.text(
      formatCurrency(parseFloat(String(invoice.shipping)), currency),
      summaryValueX,
      summaryY,
      { align: "right" }
    );
    summaryY += 4;
    doc.setDrawColor(...colors.border);
    doc.line(
      rightColumnX + 5,
      summaryY,
      rightColumnX + rightColumnWidth - 5,
      summaryY
    );
    summaryY += 6;
  }

  // Tax total (if items have tax)
  const totalTax = items.reduce((sum, item) => {
    const base = (item.quantity || 0) * (item.unit_price || 0);
    const taxAmount = base * ((item.tax || 0) / 100);
    return sum + taxAmount;
  }, 0);

  if (totalTax > 0) {
    doc.setTextColor(...colors.mutedText);
    doc.text("Tax", summaryContentX, summaryY);
    doc.setTextColor(...colors.primaryText);
    doc.text(formatCurrency(totalTax, currency), summaryValueX, summaryY, {
      align: "right",
    });
    summaryY += 4;
    doc.setDrawColor(...colors.border);
    doc.line(
      rightColumnX + 5,
      summaryY,
      rightColumnX + rightColumnWidth - 5,
      summaryY
    );
    summaryY += 6;
  }

  // TOTAL - Bold and prominent
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text("Total", summaryContentX, summaryY);

  const totalAmount = parseFloat(String(invoice.total)) || 0;
  doc.setFontSize(13);
  doc.text(formatCurrency(totalAmount, currency), summaryValueX, summaryY, {
    align: "right",
  });

  summaryY += 12;

  // Draw thick border around summary content area
  const summaryContentHeight = summaryY - (summaryBoxY + summaryHeaderHeight);
  doc.setDrawColor(...colors.tableHeader);
  doc.setLineWidth(1.5);
  doc.rect(
    rightColumnX,
    summaryBoxY + summaryHeaderHeight,
    rightColumnWidth,
    summaryContentHeight,
    "S"
  );

  y = Math.max(summaryY + 10, summaryStartY + bankDetailsHeight + 15);

  // ============================================
  // NOTES SECTION
  // ============================================
  if (invoice.notes && invoice.notes.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.mutedText);
    doc.text("NOTES", margin, y);
    y += 5;

    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 12);
    const notesHeight = Math.max(15, 8 + noteLines.length * 4);
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, y, contentWidth, notesHeight, 3, 3, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.primaryText);
    doc.text(noteLines, margin + 6, y + 7);

    y += notesHeight + 10;
  }

  // ============================================
  // FOOTER
  // ============================================
  const footerY = pageHeight - 15;

  // Footer line
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  // Thank you message
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...colors.mutedText);
  doc.text("Thank you for your business!", margin, footerY);

  // Generated by
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Generated by InvoiceFlow", pageWidth - margin, footerY, {
    align: "right",
  });

  // Save the PDF
  const filename = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
  doc.save(filename);
}
