// Script to sync Stripe subscriptions to Supabase user metadata
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncPlan() {
  console.log("Starting plan sync...\n");

  // List all customers
  const customers = await stripe.customers.list({ limit: 10 });
  console.log("Found", customers.data.length, "Stripe customers\n");

  for (const customer of customers.data) {
    console.log("Customer:", customer.email);

    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 5,
    });

    if (subs.data.length === 0) {
      console.log("  No subscriptions\n");
      continue;
    }

    for (const sub of subs.data) {
      console.log("  Subscription:", sub.id);
      console.log("    Status:", sub.status);
      console.log("    Plan metadata:", sub.metadata?.plan || "not set");

      if (sub.status === "active" || sub.status === "trialing") {
        // Find user by email in Supabase
        const { data: users, error: listError } =
          await supabase.auth.admin.listUsers();

        if (listError) {
          console.log("  Error listing users:", listError.message);
          continue;
        }

        const user = users.users.find((u) => u.email === customer.email);

        if (user) {
          console.log("  Found Supabase user:", user.id);
          console.log("  Current plan:", user.user_metadata?.plan || "none");

          // Update plan
          const plan = sub.metadata?.plan || "professional";
          const { error } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
              plan: plan,
              stripe_customer_id: customer.id,
              subscription_id: sub.id,
              subscription_status: sub.status,
              plan_synced_at: new Date().toISOString(),
            },
          });

          if (error) {
            console.log("  ❌ Error updating:", error.message);
          } else {
            console.log("  ✅ Updated plan to:", plan);
          }
        } else {
          console.log("  No matching Supabase user found for", customer.email);
        }
      }
    }
    console.log("");
  }

  console.log("Done!");
}

syncPlan().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
