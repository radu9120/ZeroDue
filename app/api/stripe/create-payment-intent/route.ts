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

    // Get user metadata to check trial eligibility and existing subscription
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    const hasUsedTrial = supabaseUser?.user_metadata?.has_used_trial === true;
    const existingSubscriptionId =
      supabaseUser?.user_metadata?.stripe_subscription_id;

    const body = await req.json();
    const { plan, billingPeriod = "monthly" } = body as {
      plan: AppPlan;
      billingPeriod?: "monthly" | "yearly";
    };

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLAN_CONFIG[plan];
    const isYearly = billingPeriod === "yearly";

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

    // Determine the price based on billing period
    const monthlyPrice = planConfig.monthlyPrice;
    const yearlyPrice =
      "yearlyPrice" in planConfig
        ? (planConfig as any).yearlyPrice
        : monthlyPrice * 12;
    const priceAmount = isYearly ? yearlyPrice : monthlyPrice;
    const billingInterval: "month" | "year" = isYearly ? "year" : "month";

    console.log(
      `Plan: ${plan}, billingPeriod: ${billingPeriod}, priceAmount: ${priceAmount}, priceId from env: ${priceId || "not set"}`
    );

    // For yearly billing or if no preset price ID, create/find price dynamically
    if (!priceId || isYearly) {
      try {
        // Fallback: find existing product by name
        console.log(`Searching for existing product for ${plan}...`);
        const products = await stripe.products.list({ limit: 100 });
        console.log(`Found ${products.data.length} products in Stripe`);

        let product = products.data.find(
          (p) => p.name === `InvoiceFlow ${planConfig.name} Plan`
        );

        if (!product) {
          console.log(`Creating new product for ${planConfig.name}...`);
          product = await stripe.products.create({
            name: `InvoiceFlow ${planConfig.name} Plan`,
            description: `${planConfig.invoicesIncluded === Infinity ? "Unlimited" : planConfig.invoicesIncluded} invoices/month`,
          });
          console.log(`Created product: ${product.id}`);
        } else {
          console.log(`Found existing product: ${product.id}`);
        }

        // Get or create price for the product with correct interval
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 100,
        });

        // Find price matching our billing interval and amount
        const matchingPrice = prices.data.find(
          (p) =>
            p.recurring?.interval === billingInterval &&
            p.unit_amount === Math.round(priceAmount * 100)
        );

        if (matchingPrice) {
          priceId = matchingPrice.id;
          console.log(`Found existing ${billingInterval}ly price: ${priceId}`);
        } else {
          console.log(
            `Creating new ${billingInterval}ly price for ${planConfig.name} at $${priceAmount}...`
          );
          const price = await stripe.prices.create({
            product: product.id,
            currency: "usd",
            unit_amount: Math.round(priceAmount * 100),
            recurring: { interval: billingInterval },
            nickname: `${planConfig.name} ${isYearly ? "Yearly" : "Monthly"}`,
          });
          priceId = price.id;
          console.log(`Created new price: ${priceId}`);
        }
      } catch (priceError: any) {
        console.error(
          `Failed to get/create product or price for ${plan}:`,
          priceError?.message || priceError
        );
        return NextResponse.json(
          {
            error: `Failed to setup ${planConfig.name} plan pricing: ${priceError?.message}`,
          },
          { status: 500 }
        );
      }
    }

    if (!priceId) {
      console.error(`Failed to get or create price for plan: ${plan}`);
      return NextResponse.json(
        { error: "Failed to configure pricing. Please contact support." },
        { status: 500 }
      );
    }

    // Check if user has an existing subscription to upgrade or cancel
    if (existingSubscriptionId) {
      try {
        console.log(
          `Checking existing subscription: ${existingSubscriptionId}`
        );
        const existingSubscription = await stripe.subscriptions.retrieve(
          existingSubscriptionId
        );

        console.log(
          `Existing subscription status: ${existingSubscription.status}`
        );

        // Handle incomplete subscriptions - cancel them and create new
        if (
          existingSubscription.status === "incomplete" ||
          existingSubscription.status === "incomplete_expired" ||
          existingSubscription.status === "past_due" ||
          existingSubscription.status === "canceled"
        ) {
          console.log(
            `Canceling ${existingSubscription.status} subscription: ${existingSubscriptionId}`
          );

          // Cancel incomplete subscription so we can create a new one
          if (existingSubscription.status !== "canceled") {
            try {
              await stripe.subscriptions.cancel(existingSubscriptionId);
              console.log(
                `Canceled incomplete subscription: ${existingSubscriptionId}`
              );
            } catch (cancelError: any) {
              console.log(
                `Could not cancel subscription (may already be canceled): ${cancelError?.message}`
              );
            }
          }

          // Clear the old subscription ID so we create a new one
          await supabase.auth.updateUser({
            data: {
              stripe_subscription_id: null,
            },
          });

          // Fall through to create new subscription
          console.log(
            "Will create new subscription after canceling incomplete one"
          );
        } else if (
          existingSubscription.status === "active" ||
          existingSubscription.status === "trialing"
        ) {
          // Check if this is a trial subscription without a payment method
          const customer = await stripe.customers.retrieve(
            existingSubscription.customer as string
          );

          // Get customer's default payment method
          const hasPaymentMethod =
            !("deleted" in customer) &&
            (customer.invoice_settings?.default_payment_method ||
              customer.default_source);

          // If trialing WITHOUT a payment method, require card first
          if (existingSubscription.status === "trialing" && !hasPaymentMethod) {
            console.log(
              "User is on trial without payment method - requiring card for upgrade"
            );

            // Create a SetupIntent to collect payment method
            const setupIntent = await stripe.setupIntents.create({
              customer: existingSubscription.customer as string,
              payment_method_types: ["card"],
              metadata: {
                userId,
                plan,
                subscriptionId: existingSubscriptionId,
                upgradeAfterSetup: "true",
              },
            });

            return NextResponse.json({
              type: "requires_payment",
              clientSecret: setupIntent.client_secret,
              subscriptionId: existingSubscriptionId,
              message: "Please add a payment method to upgrade",
              hasTrial: true,
            });
          }

          console.log(
            `Upgrading subscription to ${plan} with priceId: ${priceId}`
          );

          // Upgrade the existing subscription
          const updatedSubscription = await stripe.subscriptions.update(
            existingSubscriptionId,
            {
              items: [
                {
                  id: existingSubscription.items.data[0].id,
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

          console.log(
            `Subscription upgraded successfully: ${updatedSubscription.id}`
          );

          // Also undo any scheduled cancellation
          if (existingSubscription.cancel_at_period_end) {
            await stripe.subscriptions.update(existingSubscriptionId, {
              cancel_at_period_end: false,
            });
          }

          // Update user plan immediately
          await supabase.auth.updateUser({
            data: {
              plan: plan,
              subscription_cancel_at_period_end: false,
              subscription_cancel_at: null,
            },
          });

          return NextResponse.json({
            type: "upgrade",
            message: `Successfully upgraded to ${planConfig.name}!`,
            subscriptionId: updatedSubscription.id,
            upgraded: true,
          });
        }
      } catch (error: any) {
        // Log the actual error for debugging
        console.error(
          "Error during subscription check/upgrade:",
          error?.message || error
        );

        // If subscription not found, just proceed to create new one
        if (
          error?.type === "StripeInvalidRequestError" &&
          error?.message?.includes("No such subscription")
        ) {
          console.log("Existing subscription not found, creating new one");
        } else {
          // This is a real error, log it but try to proceed anyway
          console.error(
            "Subscription operation failed, will try creating new:",
            error
          );
        }
      }
    }

    // Create new subscription - with trial only if user hasn't used it before
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
        stripe_subscription_id: subscription.id,
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
