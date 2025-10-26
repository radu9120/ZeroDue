import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { createActivity } from "@/lib/actions/userActivity.actions";
import { Webhook, type WebhookRequiredHeaders } from "svix";

// Resend webhook events we want to track
type ResendEvent =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.complained"
  | "email.bounced"
  | "email.opened"
  | "email.clicked";

interface ResendWebhookPayload {
  type: ResendEvent;
  created_at: string;
  data: {
    // Resend may send either `email_id` or `id` as the message identifier depending on event type
    email_id?: string;
    id?: string;
    message_id?: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    opened_at?: string;
    clicked_at?: string;
    link?: string;
  };
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature (optional but recommended for production)
    const webhookSecretRaw = process.env.RESEND_WEBHOOK_SECRET;
    const webhookSecret = webhookSecretRaw?.trim();

    if (!webhookSecret) {
      console.error("Resend webhook secret is not configured");
      return new NextResponse("Webhook not configured", { status: 500 });
    }

    // Parse the webhook payload (use raw body when verifying)
    const payloadText = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Resend webhook missing signature headers", {
        svixId,
        svixTimestamp,
        svixSignature,
      });
      return new NextResponse("Invalid webhook", { status: 400 });
    }

    let payload: ResendWebhookPayload;
    try {
      const verifier = new Webhook(webhookSecret);
      payload = verifier.verify(payloadText, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      } as WebhookRequiredHeaders) as ResendWebhookPayload;
    } catch (err) {
      console.error("Resend webhook verification failed", {
        message: err instanceof Error ? err.message : String(err),
      });
      return new NextResponse("Invalid webhook", { status: 400 });
    }
    const { type, data } = payload;

    const candidateIds = Array.from(
      new Set(
        [
          typeof data.email_id === "string" ? data.email_id.trim() : null,
          typeof (data as any).id === "string" ? (data as any).id.trim() : null,
          typeof data.message_id === "string" ? data.message_id.trim() : null,
        ].filter((val): val is string => !!val && val.length > 0)
      )
    );

    let messageId: string | null = candidateIds[0] || null;

    console.log("Resend webhook received:", type, data);

    // We'll store the email_id in the database when sending and match on it here
    const supabase = createSupabaseAdminClient();

    type InvoiceRow = {
      id: number;
      invoice_number: string;
      author: string;
      business_id: number;
      email_open_count?: number | null;
      email_click_count?: number | null;
      email_id?: string | null;
    };

    let invoice: InvoiceRow | null = null;

    if (candidateIds.length > 0) {
      const invById = await supabase
        .from("Invoices")
        .select(
          "id, invoice_number, author, business_id, email_open_count, email_click_count, email_id"
        )
        .in("email_id", candidateIds)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invById.error) {
        console.warn("Invoice lookup by email_id failed", {
          ids: candidateIds,
          error: invById.error,
        });
      } else if (invById.data) {
        invoice = invById.data as InvoiceRow;
      }
    }

    if (!invoice) {
      // Fallback: try extracting invoice number from subject
      const invoiceNumberMatch = data.subject?.match(/Invoice\s+(\S+)/);
      const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : null;

      if (!invoiceNumber) {
        console.warn(
          "Invoice not found for email_id and no invoice number in subject",
          { candidateIds }
        );
        return NextResponse.json({ received: true });
      }

      const fallback = await supabase
        .from("Invoices")
        .select(
          "id, invoice_number, author, business_id, email_open_count, email_click_count, email_id"
        )
        .eq("invoice_number", invoiceNumber)
        .single();

      if (fallback.error || !fallback.data) {
        console.warn("Invoice not found by subject number:", invoiceNumber);
        return NextResponse.json({ received: true });
      }

      invoice = fallback.data as InvoiceRow;
    }

    if (!messageId && invoice.email_id) {
      messageId = invoice.email_id;
    }

    // Track different email events
    let activityAction = "";
    let statusUpdate: any = {};

    switch (type) {
      case "email.sent":
        activityAction = "Sent invoice";
        statusUpdate = {
          status: "sent",
          email_id: messageId,
          email_sent_at: data.created_at,
          email_delivered: false,
          email_delivered_at: null,
          email_opened: false,
          email_opened_at: null,
          email_open_count: 0,
          email_clicked: false,
          email_clicked_at: null,
          email_click_count: 0,
          email_bounced: false,
          email_bounced_at: null,
          email_complained: false,
          email_complained_at: null,
        };
        break;

      case "email.delivered":
        activityAction = "Invoice email delivered";
        statusUpdate = {
          email_delivered: true,
          email_delivered_at: data.created_at,
        };
        break;

      case "email.opened":
        activityAction = "Invoice email opened";
        statusUpdate = {
          email_opened: true,
          email_opened_at: data.opened_at || data.created_at,
          email_open_count: (invoice.email_open_count || 0) + 1,
        };
        break;

      case "email.clicked":
        activityAction = "Invoice email clicked";
        statusUpdate = {
          email_clicked: true,
          email_clicked_at: data.clicked_at || data.created_at,
          email_click_count: (invoice.email_click_count || 0) + 1,
        };
        break;

      case "email.bounced":
        activityAction = "Invoice email bounced";
        statusUpdate = {
          email_bounced: true,
          email_bounced_at: data.created_at,
        };
        break;

      case "email.complained":
        activityAction = "Invoice email marked as spam";
        statusUpdate = {
          email_complained: true,
          email_complained_at: data.created_at,
        };
        break;

      default:
        // Ignore other events
        return NextResponse.json({ received: true });
    }

    // Update invoice with email tracking data
    try {
      const finalUpdate = {
        ...statusUpdate,
        ...(messageId ? { email_id: messageId } : {}),
      };

      const { error: updateError } = await supabase
        .from("Invoices")
        .update(finalUpdate)
        .eq("id", invoice.id);

      if (updateError) {
        console.error("Error updating invoice email status:", updateError);
      }
    } catch (updateErr) {
      console.error("Error updating invoice:", updateErr);
    }

    // Log activity
    if (activityAction) {
      try {
        await createActivity({
          user_id: invoice.author,
          business_id: invoice.business_id,
          action: activityAction as any,
          target_type: "invoice",
          target_name: invoice.invoice_number,
          target_id: String(invoice.id),
          metadata: {
            to: data.to[0],
            email_id: messageId || invoice.email_id || undefined,
            ...(data.link && { link: data.link }),
          },
        });
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Resend webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
