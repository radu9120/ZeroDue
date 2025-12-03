import jsPDF from "jspdf";
import type { InvoiceListItem, BusinessType } from "@/types";

interface InvoiceItemRow {
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax?: number;
  amount?: number;
  start_time?: string;
  end_time?: string;
  date?: string;
}

interface ParsedBillTo {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
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
      month: "short",
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

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInvoicePDF(
  invoice: InvoiceListItem,
  company: BusinessType
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

  // Colors - matching the preview exactly
  const textDark: [number, number, number] = [30, 41, 59]; // slate-800
  const textMuted: [number, number, number] = [100, 116, 139]; // slate-500
  const borderLight: [number, number, number] = [226, 232, 240]; // slate-200

  // ============================================
  // HEADER SECTION - Company Name & Invoice Title
  // ============================================

  // Company name (top left, large and bold)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(company.name || "Company Name", margin, y + 8);

  // "INVOICE" title (top right)
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text("INVOICE", pageWidth - margin, y + 8, { align: "right" });

  y += 18;

  // Invoice number (simple text, not a badge)
  const invoiceNum = `#${invoice.invoice_number || "INV0001"}`;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(invoiceNum, pageWidth - margin, y + 2, { align: "right" });

  // Company address below name
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);

  let companyY = y;
  if (company.address) {
    const addressLines = company.address
      .split(/[,\n]/)
      .map((line) => line.trim())
      .filter(Boolean);
    addressLines.forEach((line) => {
      doc.text(line, margin, companyY);
      companyY += 5;
    });
  }

  if (company.email) {
    doc.text(company.email, margin, companyY);
    companyY += 5;
  }

  y = Math.max(companyY, y + 15) + 15;

  // ============================================
  // BILL TO & DATES SECTION
  // ============================================

  const billToStartY = y;
  const rightColumnX = pageWidth - margin - 70;

  // BILL TO label
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("BILL TO", margin, y);
  y += 6;

  // Client name
  if (billTo?.name) {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text(billTo.name, margin, y);
    y += 6;
  }

  // Client address
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);

  if (billTo?.address) {
    const addressLines = billTo.address
      .split(/[,\n]/)
      .map((line) => line.trim())
      .filter(Boolean);
    addressLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 5;
    });
  }

  if (billTo?.email) {
    doc.text(billTo.email, margin, y);
    y += 5;
  }

  if (billTo?.phone) {
    doc.text(billTo.phone, margin, y);
    y += 5;
  }

  // RIGHT SIDE: Issue Date & Due Date
  let rightY = billToStartY;

  // Issue Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("Issue Date", rightColumnX, rightY);
  rightY += 5;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    rightColumnX,
    rightY
  );
  rightY += 10;

  // Due Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text("Due Date", rightColumnX, rightY);
  rightY += 5;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(formatDate(invoice.due_date), rightColumnX, rightY);
  rightY += 10;

  y = Math.max(y, rightY + 10) + 10;

  // ============================================
  // ITEMS TABLE
  // ============================================

  // Column widths (matching preview - no TAX column)
  const col = {
    desc: contentWidth * 0.5,
    qty: contentWidth * 0.15,
    rate: contentWidth * 0.17,
    amount: contentWidth * 0.18,
  };

  // Table header - simple border bottom style matching preview
  const headerHeight = 10;
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.5);
  doc.line(margin, y + headerHeight, margin + contentWidth, y + headerHeight);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);

  let colX = margin;
  doc.text("DESCRIPTION", colX, y + 7);
  doc.text("QTY", margin + col.desc + col.qty, y + 7, { align: "right" });
  doc.text("RATE", margin + col.desc + col.qty + col.rate, y + 7, {
    align: "right",
  });
  doc.text("AMOUNT", margin + contentWidth, y + 7, { align: "right" });

  y += headerHeight + 2;

  // Table rows - matching preview styling (simple borders, no alternating)
  const rowHeight = 11;
  items.forEach((item, index) => {
    // Bottom border for each row except last
    if (index < items.length - 1) {
      doc.setDrawColor(...borderLight);
      doc.setLineWidth(0.3);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
    }

    // Description
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    const descText = item.description || "—";
    const descLines = doc.splitTextToSize(descText, col.desc - 8);
    doc.text(descLines[0], margin, y + 7);

    // Quantity (right aligned)
    doc.setTextColor(...textMuted);
    doc.text(String(item.quantity || 0), margin + col.desc + col.qty, y + 7, {
      align: "right",
    });

    // Rate (right aligned)
    doc.text(
      formatCurrency(item.unit_price || 0, currency),
      margin + col.desc + col.qty + col.rate,
      y + 7,
      { align: "right" }
    );

    // Amount (right aligned, bold)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text(
      formatCurrency(item.amount || 0, currency),
      margin + contentWidth,
      y + 7,
      { align: "right" }
    );

    y += rowHeight;
  });

  y += 15;

  // ============================================
  // TOTALS SECTION
  // ============================================

  const totalsLabelX = pageWidth - margin - 80;
  const totalsValueX = pageWidth - margin;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Subtotal", totalsLabelX, y);
  doc.setTextColor(...textDark);
  doc.text(formatCurrency(invoice.subtotal || 0, currency), totalsValueX, y, {
    align: "right",
  });
  y += 7;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setTextColor(...textMuted);
    doc.text("Discount", totalsLabelX, y);
    doc.setTextColor(239, 68, 68); // red
    doc.text(
      `-${formatCurrency(parseFloat(String(invoice.discount)), currency)}`,
      totalsValueX,
      y,
      { align: "right" }
    );
    y += 7;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setTextColor(...textMuted);
    doc.text("Shipping", totalsLabelX, y);
    doc.setTextColor(...textDark);
    doc.text(
      formatCurrency(parseFloat(String(invoice.shipping)), currency),
      totalsValueX,
      y,
      { align: "right" }
    );
    y += 7;
  }

  y += 3;

  // Separator line before total
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX - 10, y, totalsValueX, y);
  y += 8;

  // TOTAL - matching preview style (blue text)
  const accentBlue: [number, number, number] = [37, 99, 235]; // blue-600
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text("Total", totalsLabelX, y);

  const totalAmount = parseFloat(String(invoice.total)) || 0;
  doc.setTextColor(...accentBlue);
  doc.text(formatCurrency(totalAmount, currency), totalsValueX, y, {
    align: "right",
  });

  y += 20;

  // ============================================
  // NOTES SECTION (if any) - matching preview with gray background box
  // ============================================
  if (invoice.notes && invoice.notes.trim()) {
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 16);
    const notesBoxHeight = 12 + noteLines.length * 5;

    // Gray background box (slate-100)
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textMuted);
    doc.text("NOTES", margin + 8, y + 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(noteLines, margin + 8, y + 15);

    y += notesBoxHeight + 10;
  }

  // ============================================
  // BANK DETAILS (if any)
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
      // If parsing fails, treat as plain string
    }

    if (bankData && Object.keys(bankData).length > 0) {
      doc.setDrawColor(...borderLight);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("PAYMENT DETAILS", margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      Object.entries(bankData).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/[_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/(^|\s)\w/g, (m) => m.toUpperCase());

          doc.setTextColor(...textMuted);
          doc.text(`${label}:`, margin, y);
          doc.setTextColor(...textDark);
          doc.text(String(value), margin + 40, y);
          y += 5;
        }
      });
    } else if (
      typeof invoice.bank_details === "string" &&
      invoice.bank_details.trim()
    ) {
      doc.setDrawColor(...borderLight);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text("PAYMENT DETAILS", margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textDark);
      const bankLines = doc.splitTextToSize(invoice.bank_details, contentWidth);
      doc.text(bankLines, margin, y);
    }
  }

  // ============================================
  // FOOTER
  // ============================================
  const footerY = pageHeight - 12;
  doc.setDrawColor(...borderLight);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text(`Generated by InvoiceFlow`, pageWidth / 2, footerY, {
    align: "center",
  });

  // Save the PDF
  const filename = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
  doc.save(filename);
}
