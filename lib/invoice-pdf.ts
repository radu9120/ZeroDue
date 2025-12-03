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

  // Colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const secondaryColor: [number, number, number] = [100, 116, 139]; // slate-500
  const accentColor: [number, number, number] = [37, 99, 235]; // blue-600
  const tableHeaderBg: [number, number, number] = [31, 41, 55]; // gray-800
  const lightGray: [number, number, number] = [243, 244, 246]; // gray-100
  const borderColor: [number, number, number] = [229, 231, 235]; // gray-200

  // Helper functions
  const drawText = (
    text: string,
    x: number,
    yPos: number,
    options: {
      fontSize?: number;
      fontStyle?: "normal" | "bold";
      color?: [number, number, number];
      align?: "left" | "center" | "right";
      maxWidth?: number;
    } = {}
  ): number => {
    const {
      fontSize = 10,
      fontStyle = "normal",
      color = primaryColor,
      align = "left",
      maxWidth,
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(...color);

    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, yPos, { align });
      return lines.length * (fontSize * 0.4);
    }

    doc.text(text, x, yPos, { align });
    return fontSize * 0.4;
  };

  // === HEADER SECTION ===
  // Company logo
  if (company.logo) {
    try {
      const logoBase64 = await loadImageAsBase64(company.logo);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, y, 40, 16);
        y += 20;
      }
    } catch {
      // Skip logo
    }
  }

  // Company name
  drawText(company.name, margin, y, {
    fontSize: 16,
    fontStyle: "bold",
  });

  // Invoice label (right side)
  drawText("INVOICE", pageWidth - margin, margin + 5, {
    fontSize: 28,
    fontStyle: "bold",
    color: primaryColor,
    align: "right",
  });

  // Invoice number badge
  doc.setFillColor(...accentColor);
  const badgeText = `#${invoice.invoice_number || "INV0001"}`;
  const badgeWidth = doc.getTextWidth(badgeText) + 12;
  doc.roundedRect(
    pageWidth - margin - badgeWidth,
    margin + 12,
    badgeWidth,
    8,
    2,
    2,
    "F"
  );
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(badgeText, pageWidth - margin - badgeWidth / 2, margin + 17.5, {
    align: "center",
  });

  y += 8;

  // Company details
  if (company.address) {
    const addressLines = doc.splitTextToSize(company.address, 80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 4;
  }

  if (company.email) {
    drawText(company.email, margin, y, { fontSize: 9, color: secondaryColor });
    y += 4;
  }

  if (company.phone) {
    drawText(company.phone, margin, y, { fontSize: 9, color: secondaryColor });
    y += 4;
  }

  if (company.vat) {
    drawText(`VAT: ${company.vat}`, margin, y, {
      fontSize: 9,
      color: secondaryColor,
    });
    y += 4;
  }

  y += 10;

  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === BILL TO & INVOICE DETAILS ===
  const detailsStartY = y;

  // Bill To section (left)
  drawText("BILL TO", margin, y, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
  });

  y += 6;

  if (billTo?.name) {
    drawText(billTo.name, margin, y, { fontSize: 11, fontStyle: "bold" });
    y += 5;
  }

  if (billTo?.address) {
    const addressLines = doc.splitTextToSize(billTo.address, 70);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 4;
  }

  if (billTo?.email) {
    drawText(billTo.email, margin, y, { fontSize: 9, color: secondaryColor });
    y += 4;
  }

  if (billTo?.phone) {
    drawText(billTo.phone, margin, y, { fontSize: 9, color: secondaryColor });
    y += 4;
  }

  // Invoice details (right side)
  const rightColX = pageWidth - margin - 60;
  let rightY = detailsStartY;

  // Issue Date
  drawText("Issue Date", rightColX, rightY, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
  });
  rightY += 5;
  drawText(
    formatDate(invoice.issue_date || new Date().toISOString()),
    rightColX,
    rightY,
    {
      fontSize: 10,
    }
  );
  rightY += 8;

  // Due Date
  drawText("Due Date", rightColX, rightY, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
  });
  rightY += 5;
  drawText(formatDate(invoice.due_date), rightColX, rightY, {
    fontSize: 10,
  });
  rightY += 8;

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    paid: [34, 197, 94], // green
    sent: [59, 130, 246], // blue
    draft: [156, 163, 175], // gray
    overdue: [239, 68, 68], // red
  };
  const statusColor = statusColors[invoice.status] || statusColors.draft;
  const statusText = invoice.status.toUpperCase();
  const statusWidth = doc.getTextWidth(statusText) + 10;

  doc.setFillColor(...statusColor);
  doc.roundedRect(rightColX, rightY, statusWidth, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, rightColX + statusWidth / 2, rightY + 5, {
    align: "center",
  });

  y = Math.max(y, rightY + 15);

  // === ITEMS TABLE ===
  y += 5;

  // Table header
  const colWidths = {
    description: contentWidth * 0.4,
    qty: contentWidth * 0.12,
    price: contentWidth * 0.18,
    tax: contentWidth * 0.12,
    amount: contentWidth * 0.18,
  };

  const headerHeight = 10;
  doc.setFillColor(...tableHeaderBg);
  doc.roundedRect(margin, y, contentWidth, headerHeight, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  let colX = margin + 4;
  doc.text("DESCRIPTION", colX, y + 6.5);
  colX += colWidths.description;
  doc.text("QTY", colX, y + 6.5);
  colX += colWidths.qty;
  doc.text("UNIT PRICE", colX, y + 6.5);
  colX += colWidths.price;
  doc.text("TAX", colX, y + 6.5);
  colX += colWidths.tax;
  doc.text("AMOUNT", colX, y + 6.5);

  y += headerHeight;

  // Table rows
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  items.forEach((item, index) => {
    const rowHeight = 10;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(...lightGray);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    colX = margin + 4;

    // Description (with text wrapping)
    const descLines = doc.splitTextToSize(
      item.description || "",
      colWidths.description - 8
    );
    doc.text(descLines[0] || "", colX, y + 6.5);
    colX += colWidths.description;

    // Quantity
    doc.text(String(item.quantity || 0), colX, y + 6.5);
    colX += colWidths.qty;

    // Unit Price
    doc.text(formatCurrency(item.unit_price || 0, currency), colX, y + 6.5);
    colX += colWidths.price;

    // Tax
    doc.text(`${item.tax || 0}%`, colX, y + 6.5);
    colX += colWidths.tax;

    // Amount
    doc.text(formatCurrency(item.amount || 0, currency), colX, y + 6.5);

    y += rowHeight;
  });

  // Table border
  doc.setDrawColor(...tableHeaderBg);
  doc.setLineWidth(0.5);
  doc.roundedRect(
    margin,
    y - items.length * 10,
    contentWidth,
    items.length * 10,
    0,
    0,
    "S"
  );

  y += 10;

  // === TOTALS SECTION ===
  const totalsX = pageWidth - margin - 70;
  const totalsWidth = 70;

  // Subtotal
  drawText("Subtotal", totalsX, y, { fontSize: 9, color: secondaryColor });
  drawText(
    formatCurrency(invoice.subtotal || 0, currency),
    pageWidth - margin,
    y,
    {
      fontSize: 9,
      align: "right",
    }
  );
  y += 6;

  // Discount
  if (invoice.discount && invoice.discount > 0) {
    drawText("Discount", totalsX, y, { fontSize: 9, color: secondaryColor });
    drawText(
      `-${formatCurrency(invoice.discount, currency)}`,
      pageWidth - margin,
      y,
      {
        fontSize: 9,
        align: "right",
      }
    );
    y += 6;
  }

  // Shipping
  if (invoice.shipping && invoice.shipping > 0) {
    drawText("Shipping", totalsX, y, { fontSize: 9, color: secondaryColor });
    drawText(
      formatCurrency(invoice.shipping, currency),
      pageWidth - margin,
      y,
      {
        fontSize: 9,
        align: "right",
      }
    );
    y += 6;
  }

  // Divider before total
  doc.setDrawColor(...borderColor);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 6;

  // Total
  doc.setFillColor(...tableHeaderBg);
  doc.roundedRect(totalsX - 5, y - 4, totalsWidth + 10, 12, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", totalsX, y + 4);
  doc.text(
    formatCurrency(parseFloat(invoice.total) || 0, currency),
    pageWidth - margin,
    y + 4,
    {
      align: "right",
    }
  );

  y += 18;

  // === NOTES SECTION ===
  if (invoice.notes) {
    doc.setDrawColor(...borderColor);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    drawText("NOTES", margin, y, {
      fontSize: 8,
      fontStyle: "bold",
      color: secondaryColor,
    });
    y += 5;

    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...primaryColor);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 5;
  }

  // === BANK DETAILS ===
  if (invoice.bank_details) {
    try {
      const bankDetails =
        typeof invoice.bank_details === "string"
          ? JSON.parse(invoice.bank_details)
          : invoice.bank_details;

      if (
        bankDetails &&
        typeof bankDetails === "object" &&
        Object.keys(bankDetails).length > 0
      ) {
        doc.setDrawColor(...borderColor);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        drawText("BANK DETAILS", margin, y, {
          fontSize: 8,
          fontStyle: "bold",
          color: secondaryColor,
        });
        y += 5;

        Object.entries(bankDetails).forEach(([key, value]) => {
          if (value) {
            const label = key
              .replace(/[_-]+/g, " ")
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/(^|\s)\w/g, (m) => m.toUpperCase());
            drawText(`${label}: ${value}`, margin, y, {
              fontSize: 9,
              color: secondaryColor,
            });
            y += 4;
          }
        });
      }
    } catch {
      // If bank details is just a string, display it
      if (
        typeof invoice.bank_details === "string" &&
        invoice.bank_details.trim()
      ) {
        doc.setDrawColor(...borderColor);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        drawText("BANK DETAILS", margin, y, {
          fontSize: 8,
          fontStyle: "bold",
          color: secondaryColor,
        });
        y += 5;

        const bankLines = doc.splitTextToSize(
          invoice.bank_details,
          contentWidth
        );
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondaryColor);
        doc.text(bankLines, margin, y);
      }
    }
  }

  // === FOOTER ===
  const footerY = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  drawText(
    `Generated by ${company.name} using InvoiceFlow`,
    pageWidth / 2,
    footerY,
    {
      fontSize: 8,
      color: secondaryColor,
      align: "center",
    }
  );

  // Save
  const filename = `Invoice-${invoice.invoice_number || invoice.id}.pdf`;
  doc.save(filename);
}
