import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get customer ID from user metadata
    const customerId = user.user_metadata?.stripe_customer_id;

    if (!customerId) {
      // User doesn't have a Stripe customer ID, they're already on free plan
      return NextResponse.json({
        success: true,
        message: "Already on free plan",
      });
    }

    // Cancel all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    // Also get trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
    });

    const allSubscriptions = [
      ...subscriptions.data,
      ...trialingSubscriptions.data,
    ];

    if (allSubscriptions.length === 0) {
      // No active subscriptions, already on free plan
      return NextResponse.json({
        success: true,
        message: "Already on free plan",
      });
    }

    // Cancel all subscriptions immediately
    for (const subscription of allSubscriptions) {
      await stripe.subscriptions.cancel(subscription.id);
    }

    // Update user metadata to free plan
    await supabase.auth.updateUser({
      data: {
        plan: "free_user",
        subscription_status: null,
        stripe_subscription_id: null,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Subscription cancelled successfully. You are now on the free plan.",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
