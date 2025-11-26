import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { getStripeClient } from "@/lib/stripe";

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Get user's Stripe customer ID and cancel any active subscriptions
    const { data: userData } = await supabase
      .from("Users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (userData?.stripe_customer_id) {
      try {
        const stripe = getStripeClient();
        // Cancel all active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: "active",
        });

        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
        }

        // Also cancel trialing subscriptions
        const trialingSubscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: "trialing",
        });

        for (const subscription of trialingSubscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
        }
      } catch (stripeError) {
        console.error("Error canceling Stripe subscriptions:", stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // 2. Get all user's businesses
    const { data: businesses } = await supabase
      .from("Businesses")
      .select("id")
      .eq("author", userId);

    const businessIds = businesses?.map((b) => b.id) || [];

    // 3. Delete all invoices for user's businesses
    if (businessIds.length > 0) {
      await supabase.from("Invoices").delete().in("business_id", businessIds);
    }

    // 4. Delete all clients for user's businesses
    if (businessIds.length > 0) {
      await supabase.from("Clients").delete().in("business_id", businessIds);
    }

    // 5. Delete all activity logs for user
    await supabase.from("UserActivity").delete().eq("user_id", userId);

    // 6. Delete all businesses
    await supabase.from("Businesses").delete().eq("author", userId);

    // 7. Delete user record if exists
    await supabase.from("Users").delete().eq("id", userId);

    // 8. Sign out the user (client-side will handle redirect)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
