import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@/lib/auth";
import { stripe, PLAN_CONFIG } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const supabase = await createClient();

    // Get user metadata to check trial eligibility
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    const hasUsedTrial = supabaseUser?.user_metadata?.has_used_trial === true;

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

    // Create subscription - with trial only if user hasn't used it before
    const subscriptionParams: any = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["pending_setup_intent", "latest_invoice.payment_intent"],
      metadata: {
        userId,
        plan,
      },
    };

    // Only add trial if user hasn't used it before
    if (!hasUsedTrial) {
      subscriptionParams.trial_period_days = 60;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    // Mark trial as used in user metadata (regardless of whether they got trial or not)
    // This ensures they can't game the system
    await supabase.auth.updateUser({
      data: {
        has_used_trial: true,
        stripe_customer_id: customerId,
      },
    });

    // For trial subscriptions, we get a SetupIntent to collect payment method
    if (!hasUsedTrial && subscription.pending_setup_intent) {
      const setupIntent = subscription.pending_setup_intent as any;
      return NextResponse.json({
        type: "setup",
        clientSecret: setupIntent.client_secret,
        subscriptionId: subscription.id,
        customerId,
        hasTrial: true,
      });
    }

    // For non-trial subscriptions, we get a PaymentIntent for immediate charge
    const invoice = subscription.latest_invoice as any;
    if (invoice?.payment_intent?.client_secret) {
      return NextResponse.json({
        type: "payment",
        clientSecret: invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
        customerId,
        hasTrial: false,
      });
    }

    // Fallback for setup intent
    const setupIntent = subscription.pending_setup_intent as any;
    if (setupIntent) {
      return NextResponse.json({
        type: "setup",
        clientSecret: setupIntent.client_secret,
        subscriptionId: subscription.id,
        customerId,
        hasTrial: false,
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
