/**
 * Debug script to check invoice visibility issues
 * Run with: npx tsx scripts/debug-invoices.ts
 */

import { createClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

async function debugInvoices() {
  console.log("🔍 Starting invoice debugging...\n");

  // Check authentication
  const { userId } = await auth();
  console.log("1. Authentication check:");
  console.log(`   User ID: ${userId || "NOT AUTHENTICATED"}`);

  if (!userId) {
    console.log("   ❌ User is not authenticated. Please sign in first.");
    return;
  }
  console.log("   ✅ User is authenticated\n");

  const supabase = await createClient();

  // Check businesses
  console.log("2. Checking businesses:");
  const { data: businesses, error: bizError } = await supabase
    .from("Businesses")
    .select("id, name, author")
    .eq("author", userId);

  if (bizError) {
    console.log(`   ❌ Error fetching businesses: ${bizError.message}`);
    return;
  }

  if (!businesses || businesses.length === 0) {
    console.log("   ❌ No businesses found for this user.");
    console.log("   💡 Create a business first at /dashboard/business");
    return;
  }

  console.log(`   ✅ Found ${businesses.length} business(es):`);
  businesses.forEach((b) => {
    console.log(`      - ${b.name} (ID: ${b.id})`);
  });
  console.log("");

  // Check invoices for each business
  console.log("3. Checking invoices:");
  for (const business of businesses) {
    const { data: invoices, error: invError } = await supabase
      .from("Invoices")
      .select("id, invoice_number, status, total, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (invError) {
      console.log(`   ❌ Error fetching invoices for ${business.name}:`);
      console.log(`      ${invError.message}`);
      continue;
    }

    if (!invoices || invoices.length === 0) {
      console.log(`   ⚠️  No invoices found for "${business.name}"`);
      console.log(
        `      💡 Create your first invoice at: /dashboard/invoices/new?business_id=${business.id}`
      );
    } else {
      console.log(
        `   ✅ Found ${invoices.length} invoice(s) for "${business.name}":`
      );
      invoices.forEach((inv) => {
        const date = new Date(inv.created_at).toLocaleDateString();
        console.log(
          `      - ${inv.invoice_number}: ${inv.status} - $${inv.total} (${date})`
        );
      });
    }
    console.log("");
  }

  // Check RLS function
  console.log("4. Testing RLS function:");
  const testBusinessId = businesses[0].id;
  const { data: rlsTest, error: rlsError } = await supabase.rpc(
    "user_owns_business",
    { biz_id: testBusinessId }
  );

  if (rlsError) {
    console.log(`   ❌ RLS function error: ${rlsError.message}`);
  } else {
    console.log(
      `   ${rlsTest ? "✅" : "❌"} RLS function result for business ${testBusinessId}: ${rlsTest}`
    );
  }

  console.log("\n✨ Debug complete!");
}

debugInvoices().catch((error) => {
  console.error("Fatal error:", error);
});
