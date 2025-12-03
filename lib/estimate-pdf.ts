import jsPDF from "jspdf";
import type { Estimate, BusinessType, ClientType } from "@/types";

interface EstimateItem {
  description?: string;
  quantity?: number;
  rate?: number;
  unit_price?: number;
  amount?: number;
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

function parseItems(items: Estimate["items"]): EstimateItem[] {
  try {
    if (Array.isArray(items)) return items as EstimateItem[];
    if (typeof items === "string") {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (items && typeof items === "object") {
      return Object.values(items) as EstimateItem[];
    }
  } catch {
    // ignore
  }
  return [];
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

export async function generateEstimatePDF(estimate: Estimate): Promise<void> {
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

  const currency = estimate.currency || "GBP";
  const items = parseItems(estimate.items);
  const business = estimate.business;
  const client = estimate.client;

  // Check if estimate is expired
  const isExpired =
    estimate.valid_until && new Date(estimate.valid_until) < new Date();

  // Colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const secondaryColor: [number, number, number] = [100, 116, 139]; // slate-500
  const accentColor: [number, number, number] = [147, 51, 234]; // purple-600
  const tableHeaderBg: [number, number, number] = [31, 41, 55]; // gray-800
  const lightGray: [number, number, number] = [243, 244, 246]; // gray-100
  const borderColor: [number, number, number] = [229, 231, 235]; // gray-200
  const redColor: [number, number, number] = [220, 38, 38]; // red-600

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

  const drawHorizontalLine = (yPos: number, color = borderColor) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  const checkPageBreak = (requiredSpace: number): void => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // === HEADER SECTION ===

  // Logo and Business Name
  let logoLoaded = false;
  if (business?.logo) {
    try {
      const logoBase64 = await loadImageAsBase64(business.logo);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, y, 25, 25);
        logoLoaded = true;
      }
    } catch {
      // continue without logo
    }
  }

  const headerTextX = logoLoaded ? margin + 30 : margin;

  // "ESTIMATE" title
  drawText("ESTIMATE", pageWidth - margin, y + 5, {
    fontSize: 24,
    fontStyle: "bold",
    color: accentColor,
    align: "right",
  });

  // Estimate Number
  drawText(estimate.estimate_number, pageWidth - margin, y + 14, {
    fontSize: 12,
    fontStyle: "bold",
    color: primaryColor,
    align: "right",
  });

  // Status Badge (text only)
  const statusLabels: Record<string, string> = {
    draft: "DRAFT",
    sent: "SENT",
    viewed: "VIEWED",
    accepted: "ACCEPTED",
    rejected: "DECLINED",
    expired: "EXPIRED",
    converted: "CONVERTED",
  };
  const displayStatus =
    isExpired && estimate.status !== "expired"
      ? "EXPIRED"
      : statusLabels[estimate.status] || estimate.status.toUpperCase();

  const statusColors: Record<string, [number, number, number]> = {
    draft: secondaryColor,
    sent: [37, 99, 235], // blue-600
    viewed: [147, 51, 234], // purple-600
    accepted: [22, 163, 74], // green-600
    rejected: redColor,
    expired: [234, 179, 8], // yellow-600
    converted: [6, 182, 212], // cyan-600
  };

  const statusColor = isExpired
    ? statusColors.expired
    : statusColors[estimate.status] || secondaryColor;

  drawText(displayStatus, pageWidth - margin, y + 22, {
    fontSize: 9,
    fontStyle: "bold",
    color: statusColor,
    align: "right",
  });

  // Business name on the left
  if (business?.name) {
    drawText(business.name, headerTextX, y + 8, {
      fontSize: 14,
      fontStyle: "bold",
      color: primaryColor,
    });
  }

  // Description
  if (estimate.description) {
    y += logoLoaded ? 30 : 28;
    drawText(estimate.description, margin, y, {
      fontSize: 10,
      color: secondaryColor,
      maxWidth: contentWidth * 0.6,
    });
    y += 8;
  } else {
    y += logoLoaded ? 35 : 32;
  }

  // Divider
  drawHorizontalLine(y);
  y += 10;

  // === FROM & TO SECTION ===

  const leftColWidth = contentWidth * 0.48;
  const rightColX = margin + contentWidth * 0.52;

  // FROM (Business)
  if (business) {
    drawText("FROM", margin, y, {
      fontSize: 9,
      fontStyle: "bold",
      color: secondaryColor,
    });

    y += 6;

    if (business.name) {
      drawText(business.name, margin, y, {
        fontSize: 11,
        fontStyle: "bold",
        color: primaryColor,
      });
      y += 5;
    }

    if (business.email) {
      drawText(business.email, margin, y, {
        fontSize: 9,
        color: secondaryColor,
      });
      y += 4;
    }

    if (business.phone) {
      drawText(business.phone, margin, y, {
        fontSize: 9,
        color: secondaryColor,
      });
      y += 4;
    }

    if (business.address) {
      const addressLines = doc.splitTextToSize(business.address, leftColWidth);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondaryColor);
      doc.text(addressLines, margin, y);
      y += addressLines.length * 4;
    }
  }

  // TO (Client) - positioned on the right side
  let clientY =
    y -
    (business
      ? 19 +
        (business.email ? 4 : 0) +
        (business.phone ? 4 : 0) +
        (business.address ? 8 : 0)
      : 0);
  if (clientY < margin + 50) clientY = margin + 50;

  if (client) {
    drawText("PREPARED FOR", rightColX, clientY, {
      fontSize: 9,
      fontStyle: "bold",
      color: secondaryColor,
    });

    clientY += 6;

    if (client.name) {
      drawText(client.name, rightColX, clientY, {
        fontSize: 11,
        fontStyle: "bold",
        color: primaryColor,
      });
      clientY += 5;
    }

    if (client.email) {
      drawText(client.email, rightColX, clientY, {
        fontSize: 9,
        color: secondaryColor,
      });
      clientY += 4;
    }

    if (client.phone) {
      drawText(client.phone, rightColX, clientY, {
        fontSize: 9,
        color: secondaryColor,
      });
      clientY += 4;
    }

    if (client.address) {
      const addressLines = doc.splitTextToSize(client.address, leftColWidth);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondaryColor);
      doc.text(addressLines, rightColX, clientY);
      clientY += addressLines.length * 4;
    }

    // Update y to be after the longest column
    y = Math.max(y, clientY);
  }

  y += 8;

  // === DATES SECTION ===
  drawHorizontalLine(y);
  y += 8;

  // Issue Date
  drawText("Issue Date:", margin, y, {
    fontSize: 9,
    color: secondaryColor,
  });
  drawText(formatDate(estimate.issue_date), margin + 25, y, {
    fontSize: 9,
    fontStyle: "bold",
    color: primaryColor,
  });

  // Valid Until
  if (estimate.valid_until) {
    const validUntilColor = isExpired ? redColor : primaryColor;
    drawText("Valid Until:", rightColX, y, {
      fontSize: 9,
      color: secondaryColor,
    });
    drawText(
      formatDate(estimate.valid_until) + (isExpired ? " (Expired)" : ""),
      rightColX + 25,
      y,
      {
        fontSize: 9,
        fontStyle: "bold",
        color: validUntilColor,
      }
    );
  }

  y += 12;

  // === ITEMS TABLE ===
  drawText("LINE ITEMS", margin, y, {
    fontSize: 9,
    fontStyle: "bold",
    color: secondaryColor,
  });
  y += 6;

  // Table Header
  const tableY = y;
  const rowHeight = 10;
  const headerHeight = 10;

  // Column widths
  const descColWidth = contentWidth * 0.5;
  const qtyColWidth = contentWidth * 0.12;
  const rateColWidth = contentWidth * 0.18;
  const amountColWidth = contentWidth * 0.2;

  // Header background
  doc.setFillColor(...tableHeaderBg);
  doc.rect(margin, tableY, contentWidth, headerHeight, "F");

  // Header text
  const headerTextY = tableY + 6.5;
  drawText("Description", margin + 4, headerTextY, {
    fontSize: 9,
    fontStyle: "bold",
    color: [255, 255, 255],
  });
  drawText("Qty", margin + descColWidth + qtyColWidth / 2, headerTextY, {
    fontSize: 9,
    fontStyle: "bold",
    color: [255, 255, 255],
    align: "center",
  });
  drawText(
    "Rate",
    margin + descColWidth + qtyColWidth + rateColWidth - 4,
    headerTextY,
    {
      fontSize: 9,
      fontStyle: "bold",
      color: [255, 255, 255],
      align: "right",
    }
  );
  drawText("Amount", pageWidth - margin - 4, headerTextY, {
    fontSize: 9,
    fontStyle: "bold",
    color: [255, 255, 255],
    align: "right",
  });

  y = tableY + headerHeight;

  // Table rows
  items.forEach((item, index) => {
    checkPageBreak(rowHeight + 5);

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate || item.unit_price) || 0;
    const amount = item.amount ?? qty * rate;

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    const rowTextY = y + 6.5;

    // Description (with wrapping if needed)
    const descText = item.description || "—";
    const descLines = doc.splitTextToSize(descText, descColWidth - 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...primaryColor);
    doc.text(descLines[0], margin + 4, rowTextY);

    // Quantity
    drawText(
      qty.toString(),
      margin + descColWidth + qtyColWidth / 2,
      rowTextY,
      {
        fontSize: 9,
        color: secondaryColor,
        align: "center",
      }
    );

    // Rate
    drawText(
      formatCurrency(rate, currency),
      margin + descColWidth + qtyColWidth + rateColWidth - 4,
      rowTextY,
      {
        fontSize: 9,
        color: secondaryColor,
        align: "right",
      }
    );

    // Amount
    drawText(
      formatCurrency(amount, currency),
      pageWidth - margin - 4,
      rowTextY,
      {
        fontSize: 9,
        fontStyle: "bold",
        color: primaryColor,
        align: "right",
      }
    );

    y += rowHeight;
  });

  // Bottom border
  drawHorizontalLine(y);
  y += 10;

  // === TOTALS SECTION ===
  const totalsX = pageWidth - margin - 80;
  const totalsValueX = pageWidth - margin;

  // Subtotal
  drawText("Subtotal", totalsX, y, {
    fontSize: 9,
    color: secondaryColor,
  });
  drawText(formatCurrency(estimate.subtotal || 0, currency), totalsValueX, y, {
    fontSize: 9,
    color: primaryColor,
    align: "right",
  });
  y += 6;

  // Discount
  if (estimate.discount && estimate.discount > 0) {
    const discountAmount = (estimate.subtotal || 0) * (estimate.discount / 100);
    drawText(`Discount (${estimate.discount}%)`, totalsX, y, {
      fontSize: 9,
      color: redColor,
    });
    drawText(`-${formatCurrency(discountAmount, currency)}`, totalsValueX, y, {
      fontSize: 9,
      color: redColor,
      align: "right",
    });
    y += 6;
  }

  // Shipping
  if (estimate.shipping && estimate.shipping > 0) {
    drawText("Shipping", totalsX, y, {
      fontSize: 9,
      color: secondaryColor,
    });
    drawText(formatCurrency(estimate.shipping, currency), totalsValueX, y, {
      fontSize: 9,
      color: primaryColor,
      align: "right",
    });
    y += 6;
  }

  // Total
  y += 2;
  drawHorizontalLine(y);
  y += 8;

  drawText("Total", totalsX, y, {
    fontSize: 12,
    fontStyle: "bold",
    color: primaryColor,
  });
  drawText(formatCurrency(estimate.total || 0, currency), totalsValueX, y, {
    fontSize: 12,
    fontStyle: "bold",
    color: accentColor,
    align: "right",
  });

  y += 15;

  // === NOTES SECTION ===
  if (estimate.notes) {
    checkPageBreak(30);

    // Notes box
    doc.setFillColor(250, 245, 255); // purple-50
    doc.setDrawColor(233, 213, 255); // purple-200
    doc.setLineWidth(0.3);

    const notesLines = doc.splitTextToSize(estimate.notes, contentWidth - 16);
    const notesBoxHeight = Math.max(20, notesLines.length * 4.5 + 12);

    doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 3, 3, "FD");

    drawText("NOTES", margin + 8, y + 6, {
      fontSize: 8,
      fontStyle: "bold",
      color: accentColor,
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(notesLines, margin + 8, y + 13);

    y += notesBoxHeight + 8;
  }

  // === CLIENT RESPONSE SECTION ===
  if (estimate.client_notes) {
    checkPageBreak(30);

    // Response box
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);

    const responseLines = doc.splitTextToSize(
      estimate.client_notes,
      contentWidth - 16
    );
    const responseBoxHeight = Math.max(20, responseLines.length * 4.5 + 18);

    doc.roundedRect(margin, y, contentWidth, responseBoxHeight, 3, 3, "FD");

    drawText("CLIENT RESPONSE", margin + 8, y + 6, {
      fontSize: 8,
      fontStyle: "bold",
      color: secondaryColor,
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...primaryColor);
    doc.text(responseLines, margin + 8, y + 13);

    if (estimate.client_response_at) {
      drawText(
        `Responded on ${formatDate(estimate.client_response_at)}`,
        margin + 8,
        y + responseBoxHeight - 5,
        {
          fontSize: 8,
          color: secondaryColor,
        }
      );
    }

    y += responseBoxHeight + 8;
  }

  // === FOOTER ===
  const footerY = pageHeight - 15;
  drawText(
    `Estimate generated on ${new Date().toLocaleDateString("en-GB")}`,
    pageWidth / 2,
    footerY,
    {
      fontSize: 8,
      color: secondaryColor,
      align: "center",
    }
  );

  // Save the PDF
  doc.save(`Estimate-${estimate.estimate_number}.pdf`);
}
