import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

/**
 * Debug API endpoint to check what data exists in the database
 * Usage: Visit /api/dev/debug-data in your browser while logged in
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get businesses
    const { data: businesses, error: bizError } = await supabase
      .from("Businesses")
      .select("id, name, author, created_at")
      .eq("author", userId);

    if (bizError) {
      return NextResponse.json(
        { error: "Business query failed", details: bizError },
        { status: 500 }
      );
    }

    const results: any = {
      userId,
      timestamp: new Date().toISOString(),
      businesses: businesses || [],
      data: {},
    };

    // For each business, get counts of all data
    for (const biz of businesses || []) {
      const bizData: any = { businessId: biz.id, businessName: biz.name };

      // Count invoices
      const { count: invoiceCount } = await supabase
        .from("Invoices")
        .select("*", { count: "exact", head: true })
        .eq("business_id", biz.id);
      bizData.invoices = invoiceCount || 0;

      // Count clients
      const { count: clientCount } = await supabase
        .from("Clients")
        .select("*", { count: "exact", head: true })
        .eq("business_id", biz.id);
      bizData.clients = clientCount || 0;

      // Count estimates
      const { count: estimateCount } = await supabase
        .from("Estimates")
        .select("*", { count: "exact", head: true })
        .eq("business_id", biz.id);
      bizData.estimates = estimateCount || 0;

      // Count expenses
      const { count: expenseCount } = await supabase
        .from("Expenses")
        .select("*", { count: "exact", head: true })
        .eq("business_id", biz.id);
      bizData.expenses = expenseCount || 0;

      // Count recurring invoices
      const { count: recurringCount } = await supabase
        .from("RecurringInvoices")
        .select("*", { count: "exact", head: true })
        .eq("business_id", biz.id);
      bizData.recurring_invoices = recurringCount || 0;

      // Get sample invoice if any exist
      if (invoiceCount && invoiceCount > 0) {
        const { data: sampleInvoices } = await supabase
          .from("Invoices")
          .select("id, invoice_number, total, status, created_at")
          .eq("business_id", biz.id)
          .order("created_at", { ascending: false })
          .limit(3);
        bizData.sample_invoices = sampleInvoices;
      }

      results.data[biz.id] = bizData;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal error", message: error.message },
      { status: 500 }
    );
  }
}
