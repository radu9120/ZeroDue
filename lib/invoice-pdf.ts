import jsPDF from "jspdf";
import type { InvoiceListItem, BusinessType } from "@/types";

export type PDFTheme = "light" | "dark";

interface InvoiceItemRow {
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax?: number;
  amount?: number;
  start_time?: string;
  end_time?: string;
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
  // Light theme (default) - clean, modern look
  return {
    pageBg: [255, 255, 255], // white
    headerBar: [255, 255, 255], // white (no dark bar)
    primaryText: [17, 24, 39], // #111827 - gray-900
    secondaryText: [55, 65, 81], // #374151 - gray-700
    mutedText: [107, 114, 128], // #6b7280 - gray-500
    border: [229, 231, 235], // #e5e7eb - gray-200
    tableHeader: [249, 250, 251], // #f9fafb - gray-50 (subtle)
    tableHeaderText: [107, 114, 128], // #6b7280 - gray-500
    accentText: [59, 130, 246], // #3b82f6 - blue-500
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
  // HEADER - Clean, no dark bar
  // ============================================

  y = 20;

  // Company logo (if present)
  let logoHeight = 0;
  if (company.logo) {
    try {
      // Add logo on the left
      const logoMaxWidth = 50;
      const logoMaxHeight = 25;
      doc.addImage(
        company.logo,
        "AUTO",
        margin,
        y - 8,
        logoMaxWidth,
        logoMaxHeight,
        undefined,
        "FAST"
      );
      logoHeight = logoMaxHeight + 5;
    } catch (e) {
      // Logo failed to load, continue without it
      console.warn("Failed to add logo to PDF:", e);
    }
  }

  // Company name - large and bold on the left
  const companyNameY = logoHeight > 0 ? y + logoHeight : y;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text(company.name || "Company Name", margin, companyNameY);

  // Invoice number badge and INVOICE title on the right
  // Draw invoice number in a pill badge
  const invoiceNum = invoice.invoice_number || "INV0001";
  doc.setFillColor(239, 246, 255); // blue-50
  const badgeWidth = 40;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = companyNameY - 6;
  doc.roundedRect(badgeX, badgeY, badgeWidth, 7, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(invoiceNum, badgeX + badgeWidth / 2, badgeY + 5, {
    align: "center",
  });

  // INVOICE title below badge
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text("INVOICE", pageWidth - margin, companyNameY + 6, { align: "right" });

  const afterNameY = companyNameY + 6;

  // Company address details on the left
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);

  let companyY = afterNameY;
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
  // Add VAT/Tax number if present
  if (company.vat) {
    const taxLabel =
      company.tax_label === "Tax number" ? "TAX" : company.tax_label || "VAT";
    doc.text(`${taxLabel}: ${company.vat}`, margin, companyY);
    companyY += 4;
  }

  // Invoice details on the right (under company info area)
  // No bordered box, just clean aligned text
  const detailsX = pageWidth - margin;
  let detailY = afterNameY;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);

  // Invoice Date
  doc.text("Invoice Date", detailsX - 50, detailY);
  doc.setTextColor(...colors.primaryText);
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    detailsX,
    detailY,
    { align: "right" }
  );
  detailY += 5;

  // Due Date
  doc.setTextColor(...colors.mutedText);
  doc.text("Due Date", detailsX - 50, detailY);
  doc.setTextColor(...colors.primaryText);
  doc.text(formatDate(invoice.due_date), detailsX, detailY, { align: "right" });
  detailY += 5;

  // Payment Status
  const status = invoice.status || "pending";
  doc.setTextColor(...colors.mutedText);
  doc.text("Status", detailsX - 50, detailY);
  if (status === "paid") {
    doc.setTextColor(34, 197, 94); // green
  } else if (status === "overdue") {
    doc.setTextColor(239, 68, 68); // red
  } else {
    doc.setTextColor(234, 179, 8); // yellow
  }
  doc.setFont("helvetica", "bold");
  doc.text(
    status.charAt(0).toUpperCase() + status.slice(1),
    detailsX,
    detailY,
    { align: "right" }
  );

  y = Math.max(companyY + 12, detailY + 15);

  // ============================================
  // SEPARATOR LINE
  // ============================================
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ============================================
  // BILL TO SECTION - Clean two-column layout
  // ============================================
  // Left column: Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.mutedText);
  doc.text("Bill To", margin, y);

  let billY = y + 6;
  if (billTo?.name) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryText);
    doc.text(billTo.name, margin, billY);
    billY += 5;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);

  if (billTo?.address) {
    doc.text(billTo.address, margin, billY);
    billY += 4;
  }
  if (billTo?.email) {
    doc.text(billTo.email, margin, billY);
    billY += 4;
  }

  y = billY + 10;

  // ============================================
  // DESCRIPTION SECTION - Clean style
  // ============================================
  if (invoice.description && invoice.description.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.mutedText);
    doc.text("Description", margin, y);
    y += 5;

    const descLines = doc.splitTextToSize(
      invoice.description,
      contentWidth - 12
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.primaryText);
    doc.text(descLines, margin, y);

    y += descLines.length * 4 + 10;
  }

  // ============================================
  // ITEMS TABLE - Clean style
  // ============================================

  // Determine template type for column layout
  const template = invoice.invoice_template || "standard";
  const isTimesheet = template === "timesheet";
  const isHourly = template === "hourly" || template === "freelance";

  // Get tax label from company settings
  const taxLabel =
    company.tax_label === "Tax number" ? "TAX" : company.tax_label || "VAT";

  const rowHeight = 12;

  // Table header - subtle style with just underline
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.mutedText);

  // Column positions based on template type
  if (isTimesheet) {
    // Timesheet: DAY, DATE, START, FINISH, HOURS, AMOUNT
    const colDay = margin;
    const colDate = margin + contentWidth * 0.18;
    const colStart = margin + contentWidth * 0.36;
    const colFinish = margin + contentWidth * 0.5;
    const colHours = margin + contentWidth * 0.66;
    const colAmount = margin + contentWidth;

    doc.text("Day", colDay, y);
    doc.text("Date", colDate, y);
    doc.text("Start", colStart, y);
    doc.text("Finish", colFinish, y);
    doc.text("Hours", colHours, y);
    doc.text("Amount", colAmount, y, { align: "right" });

    // Header underline
    y += 3;
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Timesheet rows
    items.forEach((item, index) => {
      const rowY = y;

      // Parse date for day name
      let dayName = "-";
      let dateStr = "-";
      if (item.description) {
        try {
          const date = new Date(item.description);
          dayName = date.toLocaleDateString("en-US", { weekday: "long" });
          dateStr = date.toLocaleDateString("en-US");
        } catch {
          dayName = "-";
          dateStr = item.description;
        }
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.primaryText);
      doc.text(dayName, colDay, rowY);

      doc.setTextColor(...colors.secondaryText);
      doc.text(dateStr, colDate, rowY);
      doc.text(item.start_time || "-", colStart, rowY);
      doc.text(item.end_time || "-", colFinish, rowY);
      doc.text(String(item.quantity || 0), colHours, rowY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primaryText);
      doc.text(formatCurrency(item.amount || 0, currency), colAmount, rowY, {
        align: "right",
      });

      // Row separator
      if (index < items.length - 1) {
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.2);
        doc.line(
          margin,
          y + rowHeight - 2,
          pageWidth - margin,
          y + rowHeight - 2
        );
      }

      y += rowHeight;
    });
  } else {
    // Standard/Hourly: DESCRIPTION, QTY/HOURS, UNIT PRICE/RATE, TAX, AMOUNT
    const colDesc = margin;
    const colQty = margin + contentWidth * 0.45;
    const colPrice = margin + contentWidth * 0.58;
    const colTax = margin + contentWidth * 0.75;
    const colAmount = margin + contentWidth;

    doc.text("Description", colDesc, y);
    doc.text(isHourly ? "Hours" : "Qty", colQty, y, { align: "right" });
    doc.text(isHourly ? "Rate" : "Rate", colPrice, y, { align: "right" });
    doc.text(taxLabel, colTax, y, { align: "right" });
    doc.text("Amount", colAmount, y, { align: "right" });

    // Header underline
    y += 3;
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Table rows
    items.forEach((item, index) => {
      const rowY = y;

      // Description
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.primaryText);
      const descText = item.description || "—";
      doc.text(descText.substring(0, 40), colDesc, rowY);

      // Quantity
      doc.setTextColor(...colors.secondaryText);
      doc.text(String(item.quantity || 0), colQty, rowY, { align: "right" });

      // Unit Price
      doc.text(formatCurrency(item.unit_price || 0, currency), colPrice, rowY, {
        align: "right",
      });

      // Tax
      doc.text(`${item.tax || 0}%`, colTax, rowY, { align: "right" });

      // Amount - bold
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primaryText);
      doc.text(formatCurrency(item.amount || 0, currency), colAmount, rowY, {
        align: "right",
      });

      // Row separator
      if (index < items.length - 1) {
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.2);
        doc.line(
          margin,
          y + rowHeight - 2,
          pageWidth - margin,
          y + rowHeight - 2
        );
      }

      y += rowHeight;
    });
  }

  y += 15;

  // ============================================
  // SUMMARY SECTION - Right aligned, clean style
  // ============================================
  const summaryWidth = 80;
  const summaryX = pageWidth - margin - summaryWidth;
  let summaryY = y;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mutedText);
  doc.text("Subtotal", summaryX, summaryY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text(
    formatCurrency(invoice.subtotal || 0, currency),
    pageWidth - margin,
    summaryY,
    { align: "right" }
  );
  summaryY += 6;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.mutedText);
    doc.text("Discount", summaryX, summaryY);
    doc.setTextColor(34, 197, 94); // green-500
    doc.text(
      `-${parseFloat(String(invoice.discount))}%`,
      pageWidth - margin,
      summaryY,
      { align: "right" }
    );
    summaryY += 6;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.mutedText);
    doc.text("Shipping", summaryX, summaryY);
    doc.setTextColor(...colors.primaryText);
    doc.text(
      formatCurrency(parseFloat(String(invoice.shipping)), currency),
      pageWidth - margin,
      summaryY,
      { align: "right" }
    );
    summaryY += 6;
  }

  // Tax total
  const totalTax = items.reduce((sum, item) => {
    const base = (item.quantity || 0) * (item.unit_price || 0);
    const taxAmount = base * ((item.tax || 0) / 100);
    return sum + taxAmount;
  }, 0);

  if (totalTax > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.mutedText);
    doc.text(taxLabel, summaryX, summaryY);
    doc.setTextColor(...colors.primaryText);
    doc.text(formatCurrency(totalTax, currency), pageWidth - margin, summaryY, {
      align: "right",
    });
    summaryY += 6;
  }

  // Total separator
  summaryY += 2;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(summaryX, summaryY, pageWidth - margin, summaryY);
  summaryY += 8;

  // TOTAL
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryText);
  doc.text("Total", summaryX, summaryY);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(
    formatCurrency(parseFloat(String(invoice.total)) || 0, currency),
    pageWidth - margin,
    summaryY,
    {
      align: "right",
    }
  );

  y = summaryY + 20;

  // ============================================
  // BANK/PAYMENT DETAILS
  // ============================================
  if (invoice.bank_details) {
    let bankData: Record<string, string> | null = null;
    try {
      if (typeof invoice.bank_details === "string") {
        bankData = JSON.parse(invoice.bank_details);
      } else if (typeof invoice.bank_details === "object") {
        bankData = invoice.bank_details as Record<string, string>;
      }
    } catch {
      // ignore
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.mutedText);
    doc.text("PAYMENT DETAILS", margin, y);
    y += 6;

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
          doc.text(`${label}:`, margin, y);
          doc.setTextColor(...colors.primaryText);
          doc.text(String(value), margin + 30, y);
          y += 5;
        }
      });
    } else if (
      typeof invoice.bank_details === "string" &&
      invoice.bank_details.trim()
    ) {
      doc.setTextColor(...colors.primaryText);
      const bankLines = invoice.bank_details
        .split(/[\n,]/)
        .map((l) => l.trim())
        .filter(Boolean);
      bankLines.forEach((line) => {
        doc.text(line, margin, y);
        y += 5;
      });
    }
    y += 10;
  }

  // ============================================
  // NOTES SECTION
  // ============================================
  if (invoice.notes && invoice.notes.trim()) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.mutedText);
    doc.text("NOTES", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.secondaryText);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 10;
  }

  // Save the PDF
  const filename = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
  doc.save(filename);
}
