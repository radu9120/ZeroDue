import jsPDF from "jspdf";
import type { Estimate } from "@/types";

export type PDFTheme = "light" | "dark";

interface EstimateItem {
  description?: string;
  quantity?: number;
  rate?: number;
  unit_price?: number;
  amount?: number;
}

// Theme colors matching the invoice PDF
const COLORS = {
  dark: {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    border: "#334155",
    accent: "#8b5cf6", // purple for estimates
  },
  light: {
    bg: "#ffffff",
    cardBg: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    accent: "#8b5cf6", // purple for estimates
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
    GBP: "GBP ",
    EUR: "EUR ",
    USD: "$",
    JPY: "JPY ",
    INR: "INR ",
    CHF: "CHF ",
    CAD: "CA$",
    AUD: "A$",
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

export async function generateEstimatePDF(
  estimate: Estimate,
  theme: PDFTheme = "light"
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const c = theme === "dark" ? COLORS.dark : COLORS.light;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const rightEdge = pageWidth - margin;
  const contentWidth = pageWidth - margin * 2;
  const halfWidth = contentWidth / 2 - 5;

  const currency = estimate.currency || "GBP";
  const items = parseItems(estimate.items);
  const business = estimate.business;
  const client = estimate.client;

  // Check if estimate is expired
  const isExpired =
    estimate.valid_until && new Date(estimate.valid_until) < new Date();

  // Background
  doc.setFillColor(...hexToRgb(c.bg));
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Purple accent border at top
  doc.setFillColor(...hexToRgb(c.accent));
  doc.rect(0, 0, pageWidth, 4, "F");

  let y = margin + 4;

  // ============================================================
  // HEADER: Business name + logo (left) | ESTIMATE title (right)
  // ============================================================

  // Load and add logo if exists
  let logoLoaded = false;
  if (business?.logo) {
    try {
      const logoBase64 = await loadImageAsBase64(business.logo);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, y - 2, 18, 18);
        logoLoaded = true;
      }
    } catch {
      // continue without logo
    }
  }

  const textStartX = logoLoaded ? margin + 22 : margin;

  // Business name - bold, large
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(business?.name || "Business Name", textStartX, y + 5);

  // ESTIMATE title - right aligned
  doc.setFontSize(28);
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("ESTIMATE", rightEdge, y + 5, { align: "right" });

  y += 12;

  // Business address/email
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));

  if (business?.address) {
    const addrLines = business.address
      .split(/[,\n]/)
      .map((l) => l.trim())
      .filter(Boolean);
    addrLines.slice(0, 2).forEach((line) => {
      doc.text(line, textStartX, y);
      y += 4;
    });
  }
  if (business?.email) {
    doc.text(business.email, textStartX, y);
    y += 4;
  }
  if (business?.phone) {
    doc.text(business.phone, textStartX, y);
    y += 4;
  }

  // ============================================================
  // ESTIMATE DETAILS BOX (right side)
  // ============================================================
  const detailsBoxX = margin + halfWidth + 10;
  const detailsBoxY = margin + 12;
  const detailsBoxW = halfWidth;
  const detailsBoxH = 40;

  // Box background
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(
    detailsBoxX,
    detailsBoxY,
    detailsBoxW,
    detailsBoxH,
    3,
    3,
    "F"
  );

  // Box content
  let detY = detailsBoxY + 8;
  doc.setFontSize(9);

  // Estimate #
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Estimate #", detailsBoxX + 5, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    estimate.estimate_number || "EST0001",
    detailsBoxX + detailsBoxW - 5,
    detY,
    { align: "right" }
  );
  detY += 8;

  // Issue Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Issue Date", detailsBoxX + 5, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatDate(estimate.issue_date || new Date().toISOString()),
    detailsBoxX + detailsBoxW - 5,
    detY,
    { align: "right" }
  );
  detY += 8;

  // Valid Until
  if (estimate.valid_until) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("Valid Until", detailsBoxX + 5, detY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(isExpired ? "#dc2626" : c.text));
    doc.text(
      formatDate(estimate.valid_until) + (isExpired ? " (Expired)" : ""),
      detailsBoxX + detailsBoxW - 5,
      detY,
      { align: "right" }
    );
    detY += 8;
  }

  // Status
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

  const statusColors: Record<string, string> = {
    draft: c.textMuted,
    sent: "#3b82f6",
    viewed: "#8b5cf6",
    accepted: "#16a34a",
    rejected: "#dc2626",
    expired: "#eab308",
    converted: "#06b6d4",
  };

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Status", detailsBoxX + 5, detY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    ...hexToRgb(
      isExpired
        ? statusColors.expired
        : statusColors[estimate.status] || c.textMuted
    )
  );
  doc.text(displayStatus, detailsBoxX + detailsBoxW - 5, detY, {
    align: "right",
  });

  y = Math.max(y, detailsBoxY + detailsBoxH) + 10;

  // ============================================================
  // DIVIDER LINE
  // ============================================================
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.line(margin, y, rightEdge, y);
  y += 10;

  // ============================================================
  // PREPARED FOR (CLIENT) CARD
  // ============================================================
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("PREPARED FOR", margin, y);
  y += 5;

  // Calculate card height based on address lines
  const addressLines = client?.address
    ? client.address
        .split(/[,\n]/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
  const clientCardH = Math.max(
    32,
    18 + addressLines.length * 4 + (client?.email ? 4 : 0)
  );

  // Client card background
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(margin, y, contentWidth, clientCardH, 3, 3, "F");

  // Client content
  let clientY = y + 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(client?.name || "Client Name", margin + 8, clientY);
  clientY += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));

  // Show each address line separately
  addressLines.forEach((line) => {
    doc.text(line, margin + 8, clientY);
    clientY += 4;
  });

  if (client?.email) {
    doc.text(client.email, margin + 8, clientY);
  }

  y += clientCardH + 10;

  // ============================================================
  // DESCRIPTION CARD (if exists)
  // ============================================================
  if (estimate.description?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("DESCRIPTION", margin, y);
    y += 5;

    // Calculate height based on text
    const descLines = doc.splitTextToSize(
      estimate.description,
      contentWidth - 10
    );
    const descCardH = Math.max(12, descLines.length * 5 + 6);

    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, contentWidth, descCardH, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(descLines, margin + 5, y + 7);

    y += descCardH + 8;
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  // Table header with background
  const tableHeaderH = 10;
  doc.setFillColor(...hexToRgb(c.cardBg));
  doc.roundedRect(margin, y - 2, contentWidth, tableHeaderH, 2, 2, "F");

  const colDesc = margin + 5;
  const colQty = margin + contentWidth * 0.52;
  const colRate = margin + contentWidth * 0.68;
  const colAmount = rightEdge - 5;

  // Table header text
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("DESCRIPTION", colDesc, y + 4);
  doc.text("QTY", colQty, y + 4, { align: "center" });
  doc.text("RATE", colRate, y + 4, { align: "center" });
  doc.text("AMOUNT", colAmount, y + 4, { align: "right" });

  y += tableHeaderH + 6;

  // Table rows
  items.forEach((item, index) => {
    // Check for page break
    if (y > pageHeight - 60) {
      doc.addPage();
      doc.setFillColor(...hexToRgb(c.bg));
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      y = margin;
    }

    // Row separator line
    if (index > 0) {
      doc.setDrawColor(...hexToRgb(c.border));
      doc.setLineWidth(0.2);
      doc.line(margin, y - 4, rightEdge, y - 4);
    }

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate || item.unit_price) || 0;
    const amount = item.amount ?? qty * rate;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text((item.description || "—").substring(0, 40), colDesc, y);

    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text(String(qty), colQty, y, { align: "center" });
    doc.text(formatMoney(rate, currency), colRate, y, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(formatMoney(amount, currency), colAmount, y, { align: "right" });

    y += 10;
  });

  // Line under items table - more visible
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, rightEdge, y + 2);

  y += 18;

  // ============================================================
  // NOTES (left) & ESTIMATE SUMMARY (right)
  // ============================================================
  const summaryStartY = y;

  // NOTES (left side)
  if (estimate.notes?.trim()) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("NOTES", margin, y);
    y += 5;

    const notesLines = doc.splitTextToSize(estimate.notes, halfWidth - 10);
    const notesCardH = Math.max(20, Math.min(notesLines.length * 5 + 10, 40));

    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, halfWidth, notesCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(notesLines.slice(0, 6), margin + 5, y + 8);
  }

  // ESTIMATE SUMMARY (right side) - with header bar like invoice
  const summaryX = margin + halfWidth + 10;
  const summaryW = halfWidth;
  const summaryHeaderH = 10;
  const summaryBodyH = 38;
  const summaryH = summaryHeaderH + summaryBodyH;

  // Summary header bar (purple themed)
  const headerBg = theme === "dark" ? "#4c1d95" : "#6b21a8";
  doc.setFillColor(...hexToRgb(headerBg));
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryHeaderH, 3, 3, "F");
  doc.rect(summaryX, summaryStartY + summaryHeaderH - 3, summaryW, 3, "F");

  // Summary body
  const bodyBg = theme === "dark" ? "#1e293b" : "#ffffff";
  doc.setFillColor(...hexToRgb(bodyBg));
  doc.roundedRect(
    summaryX,
    summaryStartY + summaryHeaderH,
    summaryW,
    summaryBodyH,
    3,
    3,
    "F"
  );
  doc.rect(summaryX, summaryStartY + summaryHeaderH, summaryW, 3, "F");

  // Border around the whole summary
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryX, summaryStartY, summaryW, summaryH, 3, 3, "S");

  // Summary header text
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("ESTIMATE SUMMARY", summaryX + 5, summaryStartY + 7);

  // Subtotal
  let sumY = summaryStartY + summaryHeaderH + 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(c.textMuted));
  doc.text("Subtotal", summaryX + 5, sumY);
  doc.setTextColor(...hexToRgb(c.text));
  doc.text(
    formatMoney(estimate.subtotal || 0, currency),
    summaryX + summaryW - 5,
    sumY,
    { align: "right" }
  );

  // Discount
  if (estimate.discount && estimate.discount > 0) {
    sumY += 7;
    const discountAmount = (estimate.subtotal || 0) * (estimate.discount / 100);
    doc.setTextColor(...hexToRgb("#dc2626"));
    doc.text(`Discount (${estimate.discount}%)`, summaryX + 5, sumY);
    doc.text(
      `-${formatMoney(discountAmount, currency)}`,
      summaryX + summaryW - 5,
      sumY,
      { align: "right" }
    );
  }

  // Line under subtotal
  sumY += 5;
  doc.setDrawColor(...hexToRgb(c.border));
  doc.setLineWidth(0.2);
  doc.line(summaryX + 5, sumY, summaryX + summaryW - 5, sumY);

  sumY += 8;

  // Total
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(c.text));
  doc.text("Total", summaryX + 5, sumY);
  doc.setTextColor(...hexToRgb(c.accent));
  doc.text(
    formatMoney(estimate.total || 0, currency),
    summaryX + summaryW - 5,
    sumY,
    { align: "right" }
  );

  // ============================================================
  // CLIENT RESPONSE (if exists)
  // ============================================================
  if (estimate.client_notes) {
    y = summaryStartY + summaryH + 15;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(c.textMuted));
    doc.text("CLIENT RESPONSE", margin, y);
    y += 5;

    const responseLines = doc.splitTextToSize(
      estimate.client_notes,
      contentWidth - 10
    );
    const responseCardH = Math.max(16, responseLines.length * 5 + 10);

    doc.setFillColor(...hexToRgb(c.cardBg));
    doc.roundedRect(margin, y, contentWidth, responseCardH, 3, 3, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(c.text));
    doc.text(responseLines.slice(0, 4), margin + 5, y + 8);

    if (estimate.client_response_at) {
      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(c.textMuted));
      doc.text(
        `Responded on ${formatDate(estimate.client_response_at)}`,
        margin + 5,
        y + responseCardH - 4
      );
    }
  }

  // ============================================================
  // SAVE
  // ============================================================
  doc.save(`Estimate-${estimate.estimate_number || estimate.id}.pdf`);
}
