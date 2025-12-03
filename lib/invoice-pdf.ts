import jsPDF from "jspdf";
import type { InvoiceListItem, BusinessType } from "@/types";

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
      month: "long",
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

  // Modern color palette
  const primaryBlue: [number, number, number] = [59, 130, 246]; // Blue-500
  const darkText: [number, number, number] = [15, 23, 42]; // Slate-900
  const mutedText: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightGray: [number, number, number] = [241, 245, 249]; // Slate-100
  const borderColor: [number, number, number] = [226, 232, 240]; // Slate-200

  // ============================================
  // HEADER - Modern gradient-style header bar
  // ============================================

  // Blue accent bar at top
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 8, "F");

  y = 20;

  // Company name - large and bold
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(company.name || "Company Name", margin, y);

  // INVOICE title on the right
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlue);
  doc.text("INVOICE", pageWidth - margin, y, { align: "right" });

  y += 8;

  // Invoice number below title
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(`#${invoice.invoice_number || "INV0001"}`, pageWidth - margin, y, {
    align: "right",
  });

  y += 5;

  // Company details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);

  let companyY = y - 8;
  if (company.address) {
    const addressLines = company.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addressLines.forEach((line) => {
      doc.text(line, margin, companyY);
      companyY += 4.5;
    });
  }
  if (company.email) {
    doc.text(company.email, margin, companyY);
    companyY += 4.5;
  }
  if (company.phone) {
    doc.text(company.phone, margin, companyY);
  }

  y = Math.max(companyY + 15, 55);

  // ============================================
  // BILL TO & INVOICE DETAILS - Two column layout
  // ============================================

  // Light gray background box for this section
  const sectionHeight = 45;
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, contentWidth, sectionHeight, 4, 4, "F");

  const leftColX = margin + 10;
  const rightColX = pageWidth - margin - 70;
  const sectionY = y + 10;

  // BILL TO section
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlue);
  doc.text("BILL TO", leftColX, sectionY);

  let billY = sectionY + 6;
  if (billTo?.name) {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text(billTo.name, leftColX, billY);
    billY += 5;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);

  if (billTo?.address) {
    const addressLines = billTo.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addressLines.slice(0, 2).forEach((line) => {
      doc.text(line, leftColX, billY);
      billY += 4;
    });
  }
  if (billTo?.email) {
    doc.text(billTo.email, leftColX, billY);
    billY += 4;
  }
  if (billTo?.phone) {
    doc.text(billTo.phone, leftColX, billY);
  }

  // INVOICE DETAILS on the right
  let rightY = sectionY;

  // Issue Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlue);
  doc.text("ISSUE DATE", rightColX, rightY);
  rightY += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(
    formatDate(invoice.issue_date || new Date().toISOString()),
    rightColX,
    rightY
  );
  rightY += 10;

  // Due Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlue);
  doc.text("DUE DATE", rightColX, rightY);
  rightY += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(formatDate(invoice.due_date), rightColX, rightY);

  y += sectionHeight + 15;

  // ============================================
  // ITEMS TABLE - Modern styled table
  // ============================================

  // Table header with blue background
  const headerHeight = 12;
  doc.setFillColor(...primaryBlue);
  doc.roundedRect(margin, y, contentWidth, headerHeight, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);

  // Column positions
  const descWidth = contentWidth * 0.45;
  const qtyWidth = contentWidth * 0.12;
  const rateWidth = contentWidth * 0.2;
  const amountWidth = contentWidth * 0.23;

  doc.text("DESCRIPTION", margin + 6, y + 8);
  doc.text("QTY", margin + descWidth + qtyWidth / 2, y + 8, {
    align: "center",
  });
  doc.text("RATE", margin + descWidth + qtyWidth + rateWidth / 2, y + 8, {
    align: "center",
  });
  doc.text("AMOUNT", margin + contentWidth - 6, y + 8, { align: "right" });

  y += headerHeight;

  // Table rows
  const rowHeight = 14;
  items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 251, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    // Row border
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    const rowY = y + 9;

    // Description
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkText);
    const descText = item.description || "—";
    const descLines = doc.splitTextToSize(descText, descWidth - 10);
    doc.text(descLines[0], margin + 6, rowY);

    // Quantity
    doc.setTextColor(...mutedText);
    doc.text(
      String(item.quantity || 0),
      margin + descWidth + qtyWidth / 2,
      rowY,
      {
        align: "center",
      }
    );

    // Rate
    doc.text(
      formatCurrency(item.unit_price || 0, currency),
      margin + descWidth + qtyWidth + rateWidth / 2,
      rowY,
      { align: "center" }
    );

    // Amount - bold
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text(
      formatCurrency(item.amount || 0, currency),
      margin + contentWidth - 6,
      rowY,
      {
        align: "right",
      }
    );

    y += rowHeight;
  });

  y += 20;

  // ============================================
  // TOTALS SECTION - Right aligned with styling
  // ============================================

  const totalsBoxWidth = 90;
  const totalsX = pageWidth - margin - totalsBoxWidth;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text("Subtotal", totalsX, y);
  doc.setTextColor(...darkText);
  doc.text(
    formatCurrency(invoice.subtotal || 0, currency),
    pageWidth - margin,
    y,
    {
      align: "right",
    }
  );
  y += 7;

  // Discount (if any)
  if (invoice.discount && parseFloat(String(invoice.discount)) > 0) {
    doc.setTextColor(...mutedText);
    doc.text("Discount", totalsX, y);
    doc.setTextColor(239, 68, 68);
    doc.text(
      `-${formatCurrency(parseFloat(String(invoice.discount)), currency)}`,
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 7;
  }

  // Shipping (if any)
  if (invoice.shipping && parseFloat(String(invoice.shipping)) > 0) {
    doc.setTextColor(...mutedText);
    doc.text("Shipping", totalsX, y);
    doc.setTextColor(...darkText);
    doc.text(
      formatCurrency(parseFloat(String(invoice.shipping)), currency),
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 7;
  }

  // Tax total (if items have tax)
  const totalTax = items.reduce((sum, item) => {
    const base = (item.quantity || 0) * (item.unit_price || 0);
    const taxAmount = base * ((item.tax || 0) / 100);
    return sum + taxAmount;
  }, 0);

  if (totalTax > 0) {
    doc.setTextColor(...mutedText);
    doc.text("Tax", totalsX, y);
    doc.setTextColor(...darkText);
    doc.text(formatCurrency(totalTax, currency), pageWidth - margin, y, {
      align: "right",
    });
    y += 7;
  }

  y += 3;

  // TOTAL - Big and prominent with background
  const totalBoxHeight = 16;
  doc.setFillColor(...primaryBlue);
  doc.roundedRect(
    totalsX - 5,
    y - 2,
    totalsBoxWidth + 5,
    totalBoxHeight,
    3,
    3,
    "F"
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", totalsX, y + 8);

  const totalAmount = parseFloat(String(invoice.total)) || 0;
  doc.setFontSize(14);
  doc.text(formatCurrency(totalAmount, currency), pageWidth - margin, y + 8, {
    align: "right",
  });

  y += totalBoxHeight + 20;

  // ============================================
  // NOTES SECTION
  // ============================================
  if (invoice.notes && invoice.notes.trim()) {
    // Notes box
    doc.setFillColor(...lightGray);
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 20);
    const notesHeight = Math.max(25, 15 + noteLines.length * 4.5);
    doc.roundedRect(margin, y, contentWidth, notesHeight, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryBlue);
    doc.text("NOTES", margin + 8, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkText);
    doc.text(noteLines, margin + 8, y + 15);

    y += notesHeight + 10;
  }

  // ============================================
  // BANK DETAILS
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
      // treat as plain string
    }

    if (bankData && Object.keys(bankData).length > 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryBlue);
      doc.text("PAYMENT DETAILS", margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      Object.entries(bankData).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/[_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/(^|\s)\w/g, (m) => m.toUpperCase());

          doc.setTextColor(...mutedText);
          doc.text(`${label}:`, margin, y);
          doc.setTextColor(...darkText);
          doc.text(String(value), margin + 35, y);
          y += 5;
        }
      });
    } else if (
      typeof invoice.bank_details === "string" &&
      invoice.bank_details.trim()
    ) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryBlue);
      doc.text("PAYMENT DETAILS", margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkText);
      const bankLines = doc.splitTextToSize(invoice.bank_details, contentWidth);
      doc.text(bankLines, margin, y);
    }
  }

  // ============================================
  // FOOTER
  // ============================================
  const footerY = pageHeight - 15;

  // Footer line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  // Thank you message
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...mutedText);
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
