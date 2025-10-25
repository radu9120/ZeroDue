import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { createActivity } from "@/lib/actions/userActivity.actions";
import { Resend } from "resend";

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
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    opened_at?: string;
    clicked_at?: string;
    link?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature (optional but recommended for production)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Parse the webhook payload (use raw body when verifying)
    let payload: ResendWebhookPayload;
    if (webhookSecret) {
      const payloadText = await req.text();
      try {
        const resend = new Resend();
        payload = (await resend.webhooks.verify({
          payload: payloadText,
          headers: {
            id: req.headers.get("svix-id")!,
            timestamp: req.headers.get("svix-timestamp")!,
            signature: req.headers.get("svix-signature")!,
          },
          webhookSecret,
        })) as unknown as ResendWebhookPayload;
      } catch {
        return new NextResponse("Invalid webhook", { status: 400 });
      }
    } else {
      payload = await req.json();
    }
    const { type, data } = payload;

    console.log("Resend webhook received:", type, data);

    // We'll store the email_id in the database when sending and match on it here
    const supabase = createSupabaseAdminClient();

    // Prefer matching by email_id
    let invSelect = await supabase
      .from("Invoices")
      .select(
        "id, invoice_number, author, business_id, email_open_count, email_click_count"
      )
      .eq("email_id", data.email_id)
      .single();

    let invoice = invSelect.data as
      | (typeof invSelect.data & {
          email_open_count?: number | null;
          email_click_count?: number | null;
        })
      | null;

    if (invSelect.error || !invoice) {
      // Fallback: try extracting invoice number from subject
      const invoiceNumberMatch = data.subject?.match(/Invoice\s+(\S+)/);
      const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : null;

      if (!invoiceNumber) {
        console.warn(
          "Invoice not found for email_id and no invoice number in subject",
          { email_id: data.email_id }
        );
        return NextResponse.json({ received: true });
      }

      const fallback = await supabase
        .from("Invoices")
        .select(
          "id, invoice_number, author, business_id, email_open_count, email_click_count"
        )
        .eq("invoice_number", invoiceNumber)
        .single();

      if (fallback.error || !fallback.data) {
        console.warn("Invoice not found by subject number:", invoiceNumber);
        return NextResponse.json({ received: true });
      }

      invoice = fallback.data as typeof fallback.data & {
        email_open_count?: number | null;
        email_click_count?: number | null;
      };
    }

    // Track different email events
    let activityAction = "";
    let statusUpdate: any = {};

    switch (type) {
      case "email.sent":
        activityAction = "Sent invoice";
        statusUpdate = {
          status: "sent",
          email_id: data.email_id,
          email_sent_at: data.created_at,
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
      const { error: updateError } = await supabase
        .from("Invoices")
        .update(statusUpdate)
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
            email_id: data.email_id,
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
