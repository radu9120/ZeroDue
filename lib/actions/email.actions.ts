"use server";

import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emailWrapper, getResendClient } from "@/lib/emails";
import { getBusinessById } from "./business.actions";

export const sendInvoiceEmailAction = async (
  invoiceId: number,
  businessId: number
) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabaseAdmin = createSupabaseAdminClient();

  // Load invoice by id (admin client) and verify ownership
  const { data: invoice, error: invErr } = await supabaseAdmin
    .from("Invoices")
    .select(
      "id, author, invoice_number, bill_to, description, issue_date, due_date, total, currency, notes, bank_details, public_token, email_id"
    )
    .eq("id", invoiceId)
    .single();

  if (invErr || !invoice) {
    throw new Error("Invoice not found");
  }
  if (invoice.author !== userId) {
    throw new Error("Forbidden");
  }

  // Generate public token if it doesn't exist
  let publicToken = invoice.public_token;
  if (!publicToken) {
    publicToken = crypto.randomUUID().replace(/-/g, "");
    await supabaseAdmin
      .from("Invoices")
      .update({ public_token: publicToken })
      .eq("id", invoice.id);
  }

  // Fetch business details
  const business = await getBusinessById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  // Parse client details
  let clientEmail = "";
  let clientName = "";

  if (invoice.bill_to) {
    if (typeof invoice.bill_to === "string") {
      try {
        const parsed = JSON.parse(invoice.bill_to);
        clientEmail = parsed.email || "";
        clientName = parsed.name || "";
      } catch {
        // Handle legacy format if needed
      }
    } else if (typeof invoice.bill_to === "object") {
      clientEmail = (invoice.bill_to as any).email || "";
      clientName = (invoice.bill_to as any).name || "";
    }
  }

  if (!clientEmail) {
    throw new Error("Client email not found");
  }

  // Calculate total
  const total = Number(invoice.total || 0).toFixed(2);
  const currency = (invoice as any).currency || "GBP";
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";

  // Create public invoice URL
  const invoiceUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/invoice/${publicToken}`;

  // Send email via Resend
  const { data: emailData, error: emailError } =
    await getResendClient().emails.send({
      from: "InvoiceFlow <noreply@invoiceflow.net>",
      to: [clientEmail],
      subject: `Invoice #${invoice.invoice_number} from ${business.name}`,
      html: emailWrapper(`
        <div class="banner" style="border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <h2 class="banner-title" style="margin: 0 0 8px 0; font-size: 24px;">New Invoice from ${business.name}</h2>
          <p class="banner-text" style="margin: 0;">Invoice #${invoice.invoice_number}</p>
        </div>
        
        <p>Hi ${clientName},</p>
        
        <p>Please find attached invoice <strong>#${invoice.invoice_number}</strong> for <strong>${currencySymbol}${total}</strong>.</p>
        
        <div class="content-box" style="border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td class="list-item" style="padding: 8px 0;">Invoice Number:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${invoice.invoice_number}</td>
            </tr>
            <tr>
              <td class="list-item" style="padding: 8px 0;">Due Date:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Not specified"}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td class="content-title" style="padding: 12px 0 0 0; font-weight: 600;">Amount Due:</td>
              <td style="padding: 12px 0 0 0; text-align: right; font-weight: 700; color: #2563eb; font-size: 18px;">${currencySymbol}${total}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View & Pay Invoice →
          </a>
        </div>
        
        <p class="footer-text" style="font-size: 14px; text-align: center;">
          Or copy this link: <br>
          <a href="${invoiceUrl}" style="color: #2563eb;">${invoiceUrl}</a>
        </p>
      `),
      tags: [
        { name: "category", value: "invoice" },
        { name: "invoice_id", value: invoice.id.toString() },
      ],
    });

  if (emailError) {
    console.error("Resend Error:", emailError);
    throw new Error("Failed to send email via provider");
  }

  // Update invoice status
  const { data: updatedInvoice, error: updateError } = await supabaseAdmin
    .from("Invoices")
    .update({
      status: "sent",
      email_id: emailData?.id || null,
      email_sent_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .select()
    .single();

  if (updateError) {
    throw new Error("Email sent but failed to update invoice status");
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Invoice sent successfully!",
    updatedStatus: "sent",
    emailId: emailData?.id,
  };
};
