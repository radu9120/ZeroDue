import type { InvoiceListItem, BusinessType } from "@/types";

interface InvoiceItem {
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax?: number;
  amount?: number;
}

interface BillTo {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
}

function parseItems(items: InvoiceListItem["items"]): InvoiceItem[] {
  try {
    if (Array.isArray(items)) return items;
    if (typeof items === "string") return JSON.parse(items);
    if (items && typeof items === "object") return Object.values(items);
  } catch {}
  return [];
}

function parseBillTo(billTo: InvoiceListItem["bill_to"]): BillTo | null {
  try {
    if (!billTo) return null;
    if (typeof billTo === "string") return JSON.parse(billTo);
    if (typeof billTo === "object") return billTo as BillTo;
  } catch {}
  return null;
}

function getCurrencySymbol(currency: string): string {
  const code = currency?.toUpperCase() || "GBP";
  const symbols: Record<string, string> = {
    GBP: "£",
    EUR: "€",
    USD: "$",
    CAD: "CA$",
    AUD: "A$",
  };
  return symbols[code] || code + " ";
}

function formatCurrency(amount: number | undefined, currency: string): string {
  if (amount === undefined || isNaN(amount))
    return `${getCurrencySymbol(currency)}0.00`;
  return `${getCurrencySymbol(currency)}${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
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

function parseBankDetails(bankDetails: unknown): Record<string, string> | null {
  try {
    if (!bankDetails) return null;
    if (typeof bankDetails === "string") return JSON.parse(bankDetails);
    if (typeof bankDetails === "object")
      return bankDetails as Record<string, string>;
  } catch {}
  return null;
}

export function generateInvoiceHTML(
  invoice: InvoiceListItem,
  company: BusinessType
): string {
  const currency = invoice.currency || company.currency || "GBP";
  const items = parseItems(invoice.items);
  const billTo = parseBillTo(invoice.bill_to);
  const bankDetails = parseBankDetails(invoice.bank_details);

  const subtotal =
    Number(invoice.subtotal) ||
    items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const total = Number(invoice.total) || subtotal;
  const discount = Number(invoice.discount) || 0;
  const shipping = Number(invoice.shipping) || 0;
  const taxLabel =
    company.tax_label === "Tax number" ? "TAX" : company.tax_label || "VAT";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 14px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    .page {
      width: 100%;
      min-height: 100vh;
      background: #0f172a;
    }
    
    .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #06b6d4, #3b82f6);
    }
    
    .content {
      padding: 40px;
    }
    
    /* ===== HEADER ROW ===== */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #334155;
    }
    
    .company-block {
      flex: 1;
      text-align: left;
    }
    
    .logo {
      max-width: 180px;
      max-height: 100px;
      margin: 0 0 16px 0;
      display: block;
      border-radius: 8px;
      object-fit: contain;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    
    .company-info {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.7;
    }
    
    .invoice-block {
      text-align: right;
    }
    
    .invoice-title {
      font-size: 42px;
      font-weight: 800;
      color: #f1f5f9;
      letter-spacing: -1px;
      margin-bottom: 16px;
    }
    
    /* Invoice details box */
    .invoice-details-box {
      background: #334155;
      border-radius: 12px;
      padding: 16px 20px;
      min-width: 240px;
      text-align: left;
    }
    
    .invoice-details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    
    .invoice-details-row:not(:last-child) {
      border-bottom: 1px solid #475569;
    }
    
    .invoice-details-label {
      font-size: 13px;
      color: #94a3b8;
    }
    
    .invoice-details-value {
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
    }
    
    /* ===== BILL TO ===== */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .bill-to-box {
      background: #334155;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    
    .client-name {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 4px;
    }
    
    .client-detail {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
    }
    
    /* ===== DESCRIPTION ===== */
    .description-section {
      margin-bottom: 24px;
    }
    
    .description-box {
      background: #334155;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 14px;
      color: #cbd5e1;
    }
    
    /* ===== ITEMS TABLE ===== */
    .table-wrap {
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 32px;
      background: #334155;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    
    thead {
      background: #475569;
    }
    
    th {
      padding: 14px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      text-align: left;
      white-space: nowrap;
    }
    
    th.c { text-align: center; }
    th.r { text-align: right; }
    
    tbody tr {
      border-bottom: 1px solid #475569;
    }
    
    tbody tr:last-child {
      border-bottom: none;
    }
    
    td {
      padding: 16px;
      font-size: 14px;
      color: #e2e8f0;
      background: #334155;
      white-space: nowrap;
    }
    
    td.c { text-align: center; }
    td.r { text-align: right; }
    
    td.item-name {
      font-weight: 500;
    }
    
    td.item-amount {
      font-weight: 700;
      color: #38bdf8;
    }
    
    /* ===== BOTTOM GRID ===== */
    .bottom-row {
      display: flex;
      gap: 24px;
    }
    
    .left-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .info-box {
      background: #334155;
      border-radius: 12px;
      padding: 16px 18px;
    }
    
    .info-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    
    .info-content {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    
    /* ===== SUMMARY ===== */
    .summary-wrap {
      width: 320px;
      min-width: 320px;
      border-radius: 12px;
      overflow: hidden;
      background: #334155;
      flex-shrink: 0;
    }
    
    .summary-header {
      background: #475569;
      padding: 14px 18px;
      white-space: nowrap;
    }
    
    .summary-header-text {
      font-size: 12px;
      font-weight: 700;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    
    .summary-body {
      background: #334155;
      padding: 18px;
    }
    
    .sum-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      white-space: nowrap;
    }
    
    .sum-row:last-of-type {
      border-bottom: none;
    }
    
    .sum-label {
      font-size: 14px;
      color: #94a3b8;
      white-space: nowrap;
    }
    
    .sum-value {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
    }
    
    .sum-row.green .sum-value {
      color: #4ade80;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      margin-top: 10px;
      border-top: 1px solid #475569;
      white-space: nowrap;
    }
    
    .total-label {
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
    }
    
    .total-value {
      font-size: 20px;
      font-weight: 700;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="accent-bar"></div>
    <div class="content">
      
      <!-- HEADER -->
      <div class="header-row">
        <div class="company-block">
          ${company.logo ? `<img src="${company.logo}" alt="${company.name}" class="logo">` : ""}
          <div class="company-name">${company.name || "Company Name"}</div>
          <div class="company-info">
            ${company.address ? company.address.replace(/\n/g, "<br>") : ""}
            ${company.email ? `<br>${company.email}` : ""}
            ${company.phone ? `<br>${company.phone}` : ""}
          </div>
        </div>
        <div class="invoice-block">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-details-box">
            <div class="invoice-details-row">
              <span class="invoice-details-label">Invoice #</span>
              <span class="invoice-details-value">${invoice.invoice_number || "INV0001"}</span>
            </div>
            <div class="invoice-details-row">
              <span class="invoice-details-label">Date</span>
              <span class="invoice-details-value">${formatDate(invoice.issue_date)}</span>
            </div>
            <div class="invoice-details-row">
              <span class="invoice-details-label">Due Date</span>
              <span class="invoice-details-value">${formatDate(invoice.due_date)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- BILL TO -->
      <div class="section-title">Bill To</div>
      <div class="bill-to-box">
        <div class="client-name">${billTo?.name || "Client Name"}</div>
        <div class="client-detail">
          ${billTo?.address ? billTo.address.replace(/\n/g, "<br>") : ""}
          ${billTo?.email ? `<br>${billTo.email}` : ""}
          ${billTo?.phone ? `<br>${billTo.phone}` : ""}
        </div>
      </div>
      
      <!-- DESCRIPTION -->
      ${
        invoice.description
          ? `
      <div class="description-section">
        <div class="section-title">Description</div>
        <div class="description-box">${invoice.description}</div>
      </div>
      `
          : ""
      }
      
      <!-- ITEMS TABLE -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:40%;">Description</th>
              <th class="c" style="width:10%;">Qty</th>
              <th class="r" style="width:18%;">Unit Price</th>
              <th class="c" style="width:12%;">${taxLabel}</th>
              <th class="r" style="width:20%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .filter((item) => item.description)
              .map(
                (item) => `
            <tr>
              <td class="item-name">${item.description}</td>
              <td class="c">${item.quantity || 0}</td>
              <td class="r">${formatCurrency(item.unit_price, currency)}</td>
              <td class="c">${item.tax || 0}%</td>
              <td class="r item-amount">${formatCurrency(item.amount, currency)}</td>
            </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      <!-- BOTTOM -->
      <div class="bottom-row">
        <div class="left-col">
          <div class="info-box">
            <div class="info-title">Bank Details</div>
            <div class="info-content">
              ${
                bankDetails && Object.keys(bankDetails).length > 0
                  ? Object.entries(bankDetails)
                      .filter(([, v]) => v)
                      .map(
                        ([k, v]) =>
                          `<strong>${k.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:</strong> ${v}`
                      )
                      .join("<br>")
                  : "No bank details provided"
              }
            </div>
          </div>
          <div class="info-box">
            <div class="info-title">Notes</div>
            <div class="info-content">${invoice.notes ? invoice.notes.replace(/\n/g, "<br>") : "No additional notes"}</div>
          </div>
        </div>
        
        <div class="summary-wrap">
          <div class="summary-header">
            <div class="summary-header-text">SUMMARY</div>
          </div>
          <div class="summary-body">
            <div class="sum-row">
              <span class="sum-label">Subtotal</span>
              <span class="sum-value">${formatCurrency(subtotal, currency)}</span>
            </div>
            ${
              discount > 0
                ? `
            <div class="sum-row green">
              <span class="sum-label">Discount (${discount}%)</span>
              <span class="sum-value">-${formatCurrency((subtotal * discount) / 100, currency)}</span>
            </div>
            `
                : ""
            }
            ${
              shipping > 0
                ? `
            <div class="sum-row">
              <span class="sum-label">Shipping</span>
              <span class="sum-value">${formatCurrency(shipping, currency)}</span>
            </div>
            `
                : ""
            }
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-value">${formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</body>
</html>
`;
}
