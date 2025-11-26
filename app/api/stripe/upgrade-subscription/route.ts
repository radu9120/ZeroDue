import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLAN_CONFIG } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      plan,
      subscriptionId,
      billingPeriod = "monthly",
    } = body as {
      plan: AppPlan;
      subscriptionId: string;
      billingPeriod?: "monthly" | "yearly";
    };

    if (!plan || !subscriptionId) {
      return NextResponse.json(
        { error: "Plan and subscription ID required" },
        { status: 400 }
      );
    }

    const planConfig = PLAN_CONFIG[plan];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription not found or canceled" },
        { status: 400 }
      );
    }

    // Determine price
    const isYearly = billingPeriod === "yearly";
    const monthlyPrice = planConfig.monthlyPrice;
    const yearlyPrice =
      "yearlyPrice" in planConfig
        ? (planConfig as any).yearlyPrice
        : monthlyPrice * 12;
    const priceAmount = isYearly ? yearlyPrice : monthlyPrice;
    const billingInterval: "month" | "year" = isYearly ? "year" : "month";

    // Find or create the price
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(
      (p) => p.name === `InvoiceFlow ${planConfig.name} Plan`
    );

    if (!product) {
      product = await stripe.products.create({
        name: `InvoiceFlow ${planConfig.name} Plan`,
        description: `${planConfig.invoicesIncluded === Infinity ? "Unlimited" : planConfig.invoicesIncluded} invoices/month`,
      });
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    let priceId = prices.data.find(
      (p) =>
        p.recurring?.interval === billingInterval &&
        p.unit_amount === Math.round(priceAmount * 100)
    )?.id;

    if (!priceId) {
      const price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: Math.round(priceAmount * 100),
        recurring: { interval: billingInterval },
      });
      priceId = price.id;
    }

    // Now upgrade the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: "create_prorations",
        metadata: {
          userId,
          plan,
        },
      }
    );

    // Update user metadata
    await supabase.auth.updateUser({
      data: {
        plan: plan,
        subscription_cancel_at_period_end: false,
        subscription_cancel_at: null,
      },
    });

    console.log(`Subscription upgraded to ${plan}: ${updatedSubscription.id}`);

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${planConfig.name}!`,
      subscriptionId: updatedSubscription.id,
    });
  } catch (error: any) {
    console.error("Upgrade subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
