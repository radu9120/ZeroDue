import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { sendReactivationEmail } from "@/lib/emails";

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
    const currentPlan = user.user_metadata?.plan || "free_user";

    if (!customerId) {
      return NextResponse.json(
        {
          error: "No subscription to reactivate",
        },
        { status: 400 }
      );
    }

    // Get subscriptions that are set to cancel
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
    });

    const allSubscriptions = [
      ...subscriptions.data,
      ...trialingSubscriptions.data,
    ];

    // Find subscription that is set to cancel at period end
    const cancellingSubscription = allSubscriptions.find(
      (sub) => sub.cancel_at_period_end
    );

    if (!cancellingSubscription) {
      return NextResponse.json(
        {
          error: "No pending cancellation found",
        },
        { status: 400 }
      );
    }

    // Reactivate the subscription by setting cancel_at_period_end to false
    await stripe.subscriptions.update(cancellingSubscription.id, {
      cancel_at_period_end: false,
    });

    // Update user metadata
    await supabase.auth.updateUser({
      data: {
        subscription_cancel_at_period_end: false,
        subscription_period_end: null,
      },
    });

    // Send reactivation email
    if (user.email) {
      const planName =
        currentPlan === "enterprise" ? "Enterprise" : "Professional";
      await sendReactivationEmail(user.email, planName);
    }

    return NextResponse.json({
      success: true,
      message: `Your ${currentPlan === "enterprise" ? "Enterprise" : "Professional"} subscription has been reactivated!`,
    });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 }
    );
  }
}
