import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseClient } from "@/lib/supabase";
import { createActivity } from "@/lib/actions/userActivity.actions";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const invoiceId = Number(id);
    if (!invoiceId || Number.isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice id" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    const { data: invoice, error: fetchError } = await supabase
      .from("Invoices")
      .select("author, invoice_number, business_id")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.author !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("Invoices")
      .delete()
      .eq("id", invoiceId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete invoice" },
        { status: 500 }
      );
    }

    try {
      await createActivity({
        user_id: userId,
        business_id: invoice.business_id,
        action: "Deleted invoice",
        target_type: "invoice",
        target_name: invoice.invoice_number,
      });
    } catch (activityError) {
      console.error("Failed to log invoice deletion", activityError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invoice delete error", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
