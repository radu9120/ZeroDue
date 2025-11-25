import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@/lib/auth";
import { stripe, PLAN_CONFIG } from "@/lib/stripe";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();
    const { plan } = body as { plan: AppPlan };

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLAN_CONFIG[plan];

    if (plan === "free_user") {
      return NextResponse.json(
        { error: "Free plan doesn't require payment" },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customerId: string;
    const customers = await stripe.customers.list({
      email: user?.email || undefined,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.fullName || undefined,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Use existing price ID from env, or find/create one
    let priceId: string | undefined =
      "stripePriceId" in planConfig ? planConfig.stripePriceId : undefined;

    if (!priceId) {
      // Fallback: find existing product by name
      const products = await stripe.products.list({ limit: 20 });
      let product = products.data.find(
        (p) => p.name === `InvoiceFlow ${planConfig.name} Plan`
      );

      if (!product) {
        product = await stripe.products.create({
          name: `InvoiceFlow ${planConfig.name} Plan`,
          description: `${planConfig.invoicesIncluded === Infinity ? "Unlimited" : planConfig.invoicesIncluded} invoices/month`,
        });
      }

      // Get or create price for the product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 1,
      });

      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        const price = await stripe.prices.create({
          product: product.id,
          currency: "usd",
          unit_amount: Math.round(planConfig.monthlyPrice * 100),
          recurring: { interval: "month" },
        });
        priceId = price.id;
      }
    }

    // Create subscription with 60-day trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 60,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["pending_setup_intent"],
      metadata: {
        userId,
        plan,
      },
    });

    // For trial subscriptions, we get a SetupIntent to collect payment method
    const setupIntent = subscription.pending_setup_intent as any;

    if (setupIntent) {
      return NextResponse.json({
        type: "setup",
        clientSecret: setupIntent.client_secret,
        subscriptionId: subscription.id,
        customerId,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to create setup intent",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Stripe payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
