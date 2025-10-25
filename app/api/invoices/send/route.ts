import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { getInvoicesByAuthor } from "@/lib/actions/invoice.actions";
import { getBusinessById } from "@/lib/actions/business.actions";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { createActivity } from "@/lib/actions/userActivity.actions";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId, businessId } = body;

    if (!invoiceId || !businessId) {
      return NextResponse.json(
        { error: "Invoice ID and Business ID are required" },
        { status: 400 }
      );
    }

    // Load invoice by id (admin client) and verify ownership
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from("Invoices")
      .select(
        "id, author, invoice_number, bill_to, description, issue_date, due_date, total, currency, notes, bank_details, public_token"
      )
      .eq("id", Number(invoiceId))
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.author !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Fetch business details (will be subject to RLS; throws if not accessible)
    const business = await getBusinessById(Number(businessId));

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Client email not found" },
        { status: 400 }
      );
    }

    // Calculate total
    const total = Number(invoice.total || 0).toFixed(2);
    const currency = (invoice as any).currency || "GBP";
    const currencySymbol =
      currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";

    // Create public invoice URL (no auth required) - opens printable view
    const invoiceUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/invoice/${publicToken}`;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `${business.name} <invoices@invcyflow.com>`,
      to: [clientEmail],
      subject: `Invoice ${invoice.invoice_number} from ${business.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Invoice from ${
                business.name
              }</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hello ${clientName || "valued client"},
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                You have received a new invoice from <strong>${
                  business.name
                }</strong>.
              </p>
              
              <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Invoice Number:</td>
                    <td style="padding: 8px 0; text-align: right;">${
                      invoice.invoice_number
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Issue Date:</td>
                    <td style="padding: 8px 0; text-align: right;">${
                      invoice.issue_date
                        ? new Date(invoice.issue_date).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Due Date:</td>
                    <td style="padding: 8px 0; text-align: right;">${new Date(
                      invoice.due_date
                    ).toLocaleDateString("en-GB")}</td>
                  </tr>
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td style="padding: 12px 0; font-weight: 700; font-size: 18px;">Total Amount:</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #667eea;">${currencySymbol}${total}</td>
                  </tr>
                </table>
              </div>
              
              ${
                invoice.description
                  ? `
                <div style="margin: 20px 0;">
                  <p style="font-weight: 600; margin-bottom: 8px;">Description:</p>
                  <p style="color: #6b7280;">${invoice.description}</p>
                </div>
              `
                  : ""
              }
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Invoice
                </a>
              </div>
              
              ${
                invoice.notes
                  ? `
                <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <p style="margin: 0; font-size: 14px;"><strong>Note:</strong> ${invoice.notes}</p>
                </div>
              `
                  : ""
              }
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                If you have any questions about this invoice, please contact:
              </p>
              
              <div style="font-size: 14px; color: #6b7280;">
                <p style="margin: 5px 0;"><strong>${business.name}</strong></p>
                <p style="margin: 5px 0;">Email: ${business.email}</p>
                ${
                  business.phone
                    ? `<p style="margin: 5px 0;">Phone: ${business.phone}</p>`
                    : ""
                }
              </div>
              
              <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    // Update invoice status to "sent" after successful email delivery
    let updatedStatus: string | null = null;
    let statusUpdated = false;
    try {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("Invoices")
        .update({
          status: "sent",
          email_id: data?.id || null,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", invoice.id)
        .select("id, status")
        .single();

      if (updateError) {
        console.warn("Failed to update invoice status:", updateError);
      } else if (updated) {
        updatedStatus = updated.status as string;
        statusUpdated = true;
      }
    } catch (updateError) {
      console.warn("Error updating invoice status:", updateError);
    }

    // Log activity for sending invoice
    try {
      await createActivity({
        user_id: userId,
        business_id: Number(businessId),
        action: "Sent invoice",
        target_type: "invoice",
        target_name: invoice.invoice_number,
        // target_id: String(invoice.id), // Removed - column doesn't exist in DB
        metadata: { to: clientEmail, email_id: data?.id },
      });
    } catch (activityError) {
      console.warn("Error logging activity:", activityError);
      // Don't fail the whole request if activity logging fails
    }

    return NextResponse.json({
      success: true,
      message: statusUpdated
        ? `Invoice sent to ${clientEmail}`
        : `Invoice sent to ${clientEmail}. Status update may be delayed.`,
      emailId: data?.id,
      statusUpdated,
      updatedStatus,
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
