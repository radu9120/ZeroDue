import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

const EMAIL_STATUS_FIELDS = `
  id,
  author,
  status,
  email_id,
  email_sent_at,
  email_delivered,
  email_delivered_at,
  email_opened,
  email_opened_at,
  email_open_count,
  email_clicked,
  email_clicked_at,
  email_click_count,
  email_bounced,
  email_bounced_at,
  email_complained,
  email_complained_at
`;

const sanitizeEmailStatus = (row: any) => {
  if (!row) return null;
  const {
    id,
    status,
    email_id,
    email_sent_at,
    email_delivered,
    email_delivered_at,
    email_opened,
    email_opened_at,
    email_open_count,
    email_clicked,
    email_clicked_at,
    email_click_count,
    email_bounced,
    email_bounced_at,
    email_complained,
    email_complained_at,
  } = row;

  return {
    id,
    status: status ?? null,
    email_id: email_id ?? null,
    email_sent_at: email_sent_at ?? null,
    email_delivered: email_delivered ?? null,
    email_delivered_at: email_delivered_at ?? null,
    email_opened: email_opened ?? null,
    email_opened_at: email_opened_at ?? null,
    email_open_count: email_open_count ?? 0,
    email_clicked: email_clicked ?? null,
    email_clicked_at: email_clicked_at ?? null,
    email_click_count: email_click_count ?? 0,
    email_bounced: email_bounced ?? null,
    email_bounced_at: email_bounced_at ?? null,
    email_complained: email_complained ?? null,
    email_complained_at: email_complained_at ?? null,
  };
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const invoiceId = Number(id);

  if (!invoiceId || Number.isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("Invoices")
      .select(EMAIL_STATUS_FIELDS)
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch invoice status:", error);
      return NextResponse.json(
        { error: "Unable to fetch invoice status" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (data.author !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ invoice: sanitizeEmailStatus(data) });
  } catch (error: any) {
    console.error("Error fetching invoice status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
