import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // Fetch invoice by public token
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from("Invoices")
      .select("*")
      .eq("public_token", token)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found or invalid token" },
        { status: 404 }
      );
    }

    // Fetch business details
    const { data: business, error: bizErr } = await supabaseAdmin
      .from("Businesses")
      .select("*")
      .eq("id", invoice.business_id)
      .single();

    if (bizErr || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Generate HTML for viewing/printing
    const html = generateInvoiceHTML(invoice, business);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error: any) {
    console.error("Error generating invoice view:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice", details: error.message },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any, business: any): string {
  // Parse data
  let items: any[] = [];
  try {
    if (Array.isArray(invoice.items)) {
      items = invoice.items;
    } else if (typeof invoice.items === "string") {
      items = JSON.parse(invoice.items);
    }
  } catch (e) {
    items = [];
  }

  let billTo: any = null;
  try {
    if (typeof invoice.bill_to === "string") {
      billTo = JSON.parse(invoice.bill_to);
    } else if (invoice.bill_to) {
      billTo = invoice.bill_to;
    }
  } catch (e) {}

  let companyDetails: any = null;
  try {
    if (typeof invoice.company_details === "string") {
      companyDetails = JSON.parse(invoice.company_details);
    } else if (invoice.company_details) {
      companyDetails = invoice.company_details;
    }
  } catch (e) {}

  const currency = invoice.currency || "GBP";
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  const taxLabel = business.tax_label || companyDetails?.tax_label || "VAT";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number} - ${business.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      color: #333; 
      background: #f3f4f6; 
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      padding-bottom: 20px;
      border-bottom: 3px solid #667eea;
    }
    .header h1 { 
      color: #667eea; 
      font-size: 42px; 
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header .invoice-number {
      font-size: 20px;
      color: #6b7280;
      font-weight: 600;
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 30px; 
      margin-bottom: 30px; 
    }
    .section { 
      padding: 20px; 
      border: 3px solid #9ca3af; 
      border-radius: 8px; 
      background: white; 
    }
    .section h3 { 
      font-size: 18px; 
      margin-bottom: 15px; 
      color: #667eea; 
      font-weight: 700;
    }
    .section p { 
      margin: 8px 0; 
      font-size: 15px;
    }
    .label { 
      font-weight: 600; 
      color: #6b7280; 
      display: inline-block;
      min-width: 100px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 30px 0; 
      border: 3px solid #9ca3af;
    }
    thead { 
      background: #f3f4f6; 
    }
    th, td { 
      padding: 14px; 
      text-align: left; 
      border: 1px solid #d1d5db; 
      font-size: 15px;
    }
    th { 
      font-weight: 700; 
      color: #374151; 
    }
    .totals { 
      margin-top: 30px; 
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 3px solid #9ca3af;
    }
    .totals .row { 
      display: flex; 
      justify-content: space-between; 
      margin: 10px 0; 
      font-size: 16px;
    }
    .total-label { 
      font-weight: 600; 
    }
    .total-amount { 
      font-weight: 600;
    }
    .grand-total { 
      font-size: 28px; 
      color: #667eea; 
      font-weight: 700; 
      padding-top: 15px;
      border-top: 2px solid #d1d5db;
      margin-top: 10px;
    }
    .notes-section { 
      margin-top: 30px; 
      padding: 20px; 
      background: #f9fafb; 
      border-radius: 8px; 
      border: 3px solid #9ca3af;
    }
    .notes-section h3 {
      color: #667eea;
      font-size: 18px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    .notes-section p {
      white-space: pre-line;
      color: #374151;
      font-size: 15px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .print-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    @media print {
      body { 
        background: white; 
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
      .print-btn {
        display: none;
      }
    }
    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">📄 Print / Save as PDF</button>
  
  <div class="container">
    <div class="header">
      <h1>INVOICE</h1>
      <div class="invoice-number">#${invoice.invoice_number}</div>
    </div>

    <div class="info-grid">
      <div class="section">
        <h3>From</h3>
        ${
          companyDetails
            ? `
          <p><strong>${companyDetails.name || business.name}</strong></p>
          <p>${companyDetails.email || business.email}</p>
          ${companyDetails.phone ? `<p>${companyDetails.phone}</p>` : ""}
          ${companyDetails.address ? `<p>${companyDetails.address}</p>` : ""}
          ${companyDetails.vat ? `<p><span class="label">${taxLabel}:</span> ${companyDetails.vat}</p>` : ""}
        `
            : `
          <p><strong>${business.name}</strong></p>
          <p>${business.email}</p>
          ${business.phone ? `<p>${business.phone}</p>` : ""}
          ${business.address ? `<p>${business.address}</p>` : ""}
        `
        }
      </div>

      <div class="section">
        <h3>Bill To</h3>
        ${
          billTo
            ? `
          <p><strong>${billTo.name}</strong></p>
          <p>${billTo.email}</p>
          ${billTo.phone ? `<p>${billTo.phone}</p>` : ""}
          ${billTo.address ? `<p>${billTo.address}</p>` : ""}
        `
            : "<p>No client information</p>"
        }
      </div>
    </div>

    <div class="info-grid">
      <div class="section">
        <p><span class="label">Issue Date:</span> ${
          invoice.issue_date
            ? new Date(invoice.issue_date).toLocaleDateString()
            : "N/A"
        }</p>
        <p><span class="label">Due Date:</span> ${new Date(
          invoice.due_date
        ).toLocaleDateString()}</p>
        <p><span class="label">Status:</span> <strong>${(invoice.status || "draft").toUpperCase()}</strong></p>
      </div>
      <div class="section">
        <p><span class="label">Currency:</span> ${currency}</p>
        ${
          invoice.description
            ? `<p><span class="label">Description:</span> ${invoice.description}</p>`
            : ""
        }
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 80px;">Qty</th>
          <th style="text-align: right; width: 120px;">Unit Price</th>
          <th style="text-align: center; width: 80px;">${taxLabel} %</th>
          <th style="text-align: right; width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item: any) => `
          <tr>
            <td>${item.description || "N/A"}</td>
            <td style="text-align: center;">${item.quantity || 0}</td>
            <td style="text-align: right;">${currencySymbol}${(item.unit_price || 0).toFixed(2)}</td>
            <td style="text-align: center;">${item.tax || 0}%</td>
            <td style="text-align: right;"><strong>${currencySymbol}${(item.amount || 0).toFixed(2)}</strong></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      ${
        invoice.subtotal
          ? `
        <div class="row">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">${currencySymbol}${invoice.subtotal.toFixed(2)}</span>
        </div>
      `
          : ""
      }
      ${
        invoice.discount && invoice.discount > 0
          ? `
        <div class="row">
          <span class="total-label">Discount (${invoice.discount}%):</span>
          <span class="total-amount">-${currencySymbol}${((invoice.subtotal || 0) * (invoice.discount / 100)).toFixed(2)}</span>
        </div>
      `
          : ""
      }
      ${
        invoice.shipping && invoice.shipping > 0
          ? `
        <div class="row">
          <span class="total-label">Shipping:</span>
          <span class="total-amount">${currencySymbol}${invoice.shipping.toFixed(2)}</span>
        </div>
      `
          : ""
      }
      <div class="row grand-total">
        <span>Total Due:</span>
        <span>${invoice.total}</span>
      </div>
    </div>

    ${
      invoice.notes || invoice.bank_details
        ? `
      <div class="notes-section">
        ${
          invoice.notes
            ? `
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        `
            : ""
        }
        ${
          invoice.bank_details
            ? `
          <h3 style="${invoice.notes ? "margin-top: 20px;" : ""}">Payment Details</h3>
          <p>${invoice.bank_details}</p>
        `
            : ""
        }
      </div>
    `
        : ""
    }

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 14px;">
      <p>Thank you for your business!</p>
      <p style="margin-top: 8px;">This invoice was generated by ${business.name}</p>
    </div>
  </div>
</body>
</html>
  `;
}
