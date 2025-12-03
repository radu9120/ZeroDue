import jsPDF from "jspdf";
import type { Expense, BusinessType } from "@/types";

type PartialBusiness = Pick<
  BusinessType,
  "id" | "name" | "email" | "currency" | "logo" | "address" | "phone" | "vat"
>;

const categoryLabels: Record<string, string> = {
  travel: "Travel",
  meals: "Meals & Entertainment",
  office: "Office Supplies",
  software: "Software & Tools",
  equipment: "Equipment",
  marketing: "Marketing",
  utilities: "Utilities",
  rent: "Rent & Lease",
  insurance: "Insurance",
  professional_services: "Professional Services",
  other: "Other",
};

const paymentMethodLabels: Record<string, string> = {
  card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  paypal: "PayPal",
  check: "Cheque",
  other: "Other",
};

function formatCurrency(amount: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export async function generateExpenseReceiptPDF(
  expense: Expense,
  business: PartialBusiness
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const currency = expense.currency || business.currency || "GBP";

  // Colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const secondaryColor: [number, number, number] = [100, 116, 139]; // slate-500
  const accentColor: [number, number, number] = [59, 130, 246]; // blue-500
  const lightGray: [number, number, number] = [241, 245, 249]; // slate-100

  // Helper function to draw text
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
  ) => {
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

  // Helper to draw a rounded rectangle
  const drawRoundedRect = (
    x: number,
    yPos: number,
    width: number,
    height: number,
    radius: number,
    fillColor: [number, number, number]
  ) => {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, yPos, width, height, radius, radius, "F");
  };

  // === HEADER ===
  // Title
  drawText("EXPENSE RECEIPT", margin, y, {
    fontSize: 22,
    fontStyle: "bold",
    color: primaryColor,
  });

  // Receipt number
  y += 8;
  drawText(`#${String(expense.id).padStart(6, "0")}`, margin, y, {
    fontSize: 10,
    color: secondaryColor,
  });

  // Business logo and name (right side)
  if (business.logo) {
    try {
      const logoBase64 = await loadImageAsBase64(business.logo);
      if (logoBase64) {
        doc.addImage(
          logoBase64,
          "PNG",
          pageWidth - margin - 30,
          margin - 5,
          30,
          12
        );
      }
    } catch {
      // Skip logo if it fails to load
    }
  }

  drawText(business.name, pageWidth - margin, margin + 12, {
    fontSize: 12,
    fontStyle: "bold",
    align: "right",
  });

  // Divider line
  y += 10;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // === BUSINESS & DATE SECTION ===
  y += 10;

  // Business Details (left)
  drawText("BUSINESS DETAILS", margin, y, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
  });

  y += 5;
  drawText(business.name, margin, y, { fontSize: 10, fontStyle: "bold" });

  if (business.address) {
    y += 4;
    drawText(business.address, margin, y, {
      fontSize: 9,
      color: secondaryColor,
      maxWidth: 80,
    });
    y += 4;
  }

  if (business.email) {
    y += 4;
    drawText(business.email, margin, y, { fontSize: 9, color: secondaryColor });
  }

  if (business.phone) {
    y += 4;
    drawText(business.phone, margin, y, { fontSize: 9, color: secondaryColor });
  }

  if (business.vat) {
    y += 4;
    drawText(`VAT: ${business.vat}`, margin, y, {
      fontSize: 9,
      color: secondaryColor,
    });
  }

  // Expense Date (right side)
  const dateY = y - 20;
  drawText("EXPENSE DATE", pageWidth - margin, dateY, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
    align: "right",
  });

  drawText(formatDate(expense.expense_date), pageWidth - margin, dateY + 6, {
    fontSize: 12,
    fontStyle: "bold",
    align: "right",
  });

  drawText(
    `Created: ${formatShortDate(expense.created_at)}`,
    pageWidth - margin,
    dateY + 12,
    {
      fontSize: 9,
      color: secondaryColor,
      align: "right",
    }
  );

  // === MAIN EXPENSE BOX ===
  y += 15;
  const boxHeight = 30;
  drawRoundedRect(margin, y, contentWidth, boxHeight, 3, lightGray);

  // Description (left)
  drawText("DESCRIPTION", margin + 6, y + 6, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
  });
  drawText(expense.description, margin + 6, y + 12, {
    fontSize: 11,
    fontStyle: "bold",
    maxWidth: contentWidth / 2 - 10,
  });

  // Amount (right)
  drawText("AMOUNT", pageWidth - margin - 6, y + 6, {
    fontSize: 8,
    fontStyle: "bold",
    color: secondaryColor,
    align: "right",
  });
  drawText(
    formatCurrency(expense.amount, currency),
    pageWidth - margin - 6,
    y + 14,
    {
      fontSize: 16,
      fontStyle: "bold",
      align: "right",
    }
  );

  y += boxHeight + 10;

  // === INFO GRID ===
  const gridItems: { label: string; value: string }[] = [
    {
      label: "Category",
      value: categoryLabels[expense.category] || expense.category,
    },
  ];

  if (expense.vendor) {
    gridItems.push({ label: "Vendor", value: expense.vendor });
  }

  if (expense.payment_method) {
    gridItems.push({
      label: "Payment Method",
      value:
        paymentMethodLabels[expense.payment_method] || expense.payment_method,
    });
  }

  // Status
  const statusParts: string[] = [];
  if (expense.is_billable) statusParts.push("Billable");
  if (expense.is_tax_deductible) statusParts.push("Tax Deductible");
  if (statusParts.length > 0) {
    gridItems.push({ label: "Status", value: statusParts.join(", ") });
  }

  const itemWidth = (contentWidth - 6) / Math.min(gridItems.length, 4);
  gridItems.forEach((item, index) => {
    const itemX = margin + index * itemWidth;

    // Draw border box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(itemX, y, itemWidth - 4, 18, 2, 2, "S");

    drawText(item.label.toUpperCase(), itemX + 4, y + 5, {
      fontSize: 7,
      fontStyle: "bold",
      color: secondaryColor,
    });

    drawText(item.value, itemX + 4, y + 11, {
      fontSize: 9,
      fontStyle: "bold",
      maxWidth: itemWidth - 10,
    });
  });

  y += 25;

  // === TAX INFO ===
  if (expense.tax_amount || expense.tax_rate) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "S");

    drawText("TAX INFORMATION", margin + 4, y + 5, {
      fontSize: 7,
      fontStyle: "bold",
      color: secondaryColor,
    });

    let taxText = "";
    if (expense.tax_rate) {
      taxText += `Tax Rate: ${expense.tax_rate}%`;
    }
    if (expense.tax_amount) {
      if (taxText) taxText += "   •   ";
      taxText += `Tax Amount: ${formatCurrency(expense.tax_amount, currency)}`;
    }

    drawText(taxText, margin + 4, y + 11, { fontSize: 9 });
    y += 22;
  }

  // === NOTES ===
  if (expense.notes) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;
    drawText("NOTES", margin, y, {
      fontSize: 7,
      fontStyle: "bold",
      color: secondaryColor,
    });

    y += 5;
    const noteLines = doc.splitTextToSize(expense.notes, contentWidth);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...primaryColor);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4;
  }

  // === FOOTER ===
  y = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 5, pageWidth - margin, y - 5);

  drawText(
    `This expense receipt was generated by ${business.name} using InvoiceFlow.`,
    pageWidth / 2,
    y,
    {
      fontSize: 8,
      color: secondaryColor,
      align: "center",
    }
  );

  // Save the PDF
  const filename = `expense-${expense.id}-${expense.description
    .slice(0, 20)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")}.pdf`;
  doc.save(filename);
}
