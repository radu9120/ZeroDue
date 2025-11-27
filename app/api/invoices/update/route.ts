import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlan } from "@/lib/plan";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      invoiceId,
      bank_details,
      notes,
      status,
      description,
      issue_date,
      due_date,
      currency,
      discount,
      shipping,
      items,
    } = body as {
      invoiceId?: number;
      bank_details?: string;
      notes?: string;
      status?: string;
      description?: string;
      issue_date?: string;
      due_date?: string;
      currency?: string;
      discount?: number;
      shipping?: number;
      items?: string | any[];
    };

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Ensure the invoice belongs to the current user
    const { data: invoice, error: fetchErr } = await supabase
      .from("Invoices")
      .select("id, author")
      .eq("id", invoiceId)
      .single();

    if (fetchErr || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.author !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan: AppPlan = await getCurrentPlan();
    const updates: Record<string, unknown> = {};
    if (typeof bank_details === "string") updates.bank_details = bank_details;
    if (typeof notes === "string") updates.notes = notes;
    if (typeof status === "string") updates.status = status;

    if (plan !== "free_user") {
      if (typeof description === "string") updates.description = description;
      if (typeof issue_date === "string") updates.issue_date = issue_date;
      if (typeof due_date === "string") updates.due_date = due_date;
      if (typeof currency === "string") updates.currency = currency;
      if (typeof discount === "number") updates.discount = discount;
      if (typeof shipping === "number") updates.shipping = shipping;
      if (items) {
        try {
          const arr = Array.isArray(items)
            ? items
            : JSON.parse(items as string);
          updates.items = JSON.stringify(arr);
          const subtotal = (arr as any[]).reduce((sum, it) => {
            const qty = Number(it.quantity || 0);
            const price = Number(it.unit_price || 0);
            const tax = Number(it.tax || 0);
            const base = qty * price;
            const total = base + (base * tax) / 100;
            return sum + (Number.isFinite(total) ? total : 0);
          }, 0);
          const ship = typeof shipping === "number" ? shipping : 0;
          const disc = typeof discount === "number" ? discount : 0;
          const grand = subtotal + ship - (subtotal * disc) / 100;
          updates.subtotal = Number(subtotal.toFixed(2));
          updates.total = Number(grand.toFixed(2));
        } catch {
          return NextResponse.json(
            { error: "Invalid items format" },
            { status: 400 }
          );
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateErr } = await supabase
      .from("Invoices")
      .update(updates)
      .eq("id", invoiceId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, invoice: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
