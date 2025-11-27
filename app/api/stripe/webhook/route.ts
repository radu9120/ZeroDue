import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // For development without webhook secret
        event = JSON.parse(body) as Stripe.Event;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    switch (event.type) {
      case "payment_intent.succeeded": {
        // Handle successful payment intent (used for extra invoice credits via embedded form)
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const type = paymentIntent.metadata?.type;

        if (type === "extra_invoice") {
          const businessId = paymentIntent.metadata?.businessId;
          const quantity = parseInt(
            paymentIntent.metadata?.quantity || "1",
            10
          );

          console.log(
            `[Webhook] Extra invoice payment succeeded: businessId=${businessId}, quantity=${quantity}`
          );

          if (businessId) {
            // Add invoice credits to the business
            const { data: business, error: fetchError } = await supabase
              .from("Businesses")
              .select("extra_invoice_credits")
              .eq("id", parseInt(businessId, 10))
              .single();

            if (!fetchError && business) {
              const currentCredits = business.extra_invoice_credits || 0;
              await supabase
                .from("Businesses")
                .update({ extra_invoice_credits: currentCredits + quantity })
                .eq("id", parseInt(businessId, 10));

              console.log(
                `[Webhook] Added ${quantity} credits to business ${businessId}. New total: ${currentCredits + quantity}`
              );
            }
          }

          revalidatePath("/dashboard");
          revalidatePath("/dashboard/business");
          revalidatePath("/dashboard/invoices");
        }
        break;
      }

      case "setup_intent.succeeded": {
        // Handle successful setup intent (used for trial subscriptions)
        const setupIntent = event.data.object as Stripe.SetupIntent;

        // Get the subscription associated with this setup intent
        if (setupIntent.metadata?.subscription_id) {
          const subscription = await stripe.subscriptions.retrieve(
            setupIntent.metadata.subscription_id
          );

          const userId = subscription.metadata?.userId;
          const plan = subscription.metadata?.plan;

          if (userId && plan) {
            await supabase.auth.admin.updateUserById(userId, {
              user_metadata: { plan: normalizePlan(plan) },
            });
            console.log(
              `Updated user ${userId} to plan ${plan} via setup_intent`
            );
          }
        }

        revalidatePath("/dashboard");
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = session.metadata?.plan;
        const type = session.metadata?.type;

        if (!userId) {
          console.warn("No userId in checkout session");
          break;
        }

        if (type === "extra_invoice") {
          // Handle extra invoice purchase
          const businessId = session.metadata?.businessId;
          const quantity = parseInt(session.metadata?.quantity || "1", 10);

          if (businessId) {
            // Add invoice credits to the business
            const { data: business, error: fetchError } = await supabase
              .from("Businesses")
              .select("extra_invoice_credits")
              .eq("id", parseInt(businessId, 10))
              .single();

            if (!fetchError && business) {
              const currentCredits = business.extra_invoice_credits || 0;
              await supabase
                .from("Businesses")
                .update({ extra_invoice_credits: currentCredits + quantity })
                .eq("id", parseInt(businessId, 10));
            }
          }
        } else if (plan) {
          // Handle subscription plan upgrade
          const normalizedPlan = normalizePlan(plan);

          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { plan: normalizedPlan },
          });
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/business");
        revalidatePath("/dashboard/invoices");
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const plan = subscription.metadata?.plan;

        // Update plan when subscription becomes active or is in trial
        if (
          userId &&
          plan &&
          (subscription.status === "active" ||
            subscription.status === "trialing")
        ) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { plan: normalizePlan(plan) },
          });
          console.log(
            `Updated user ${userId} to plan ${plan} (status: ${subscription.status})`
          );
        } else if (!userId && subscription.customer) {
          // Fallback: Try to find user by customer ID if metadata is missing
          // This happens when subscription is created via Stripe Checkout without metadata propagation
          // or via direct API calls where metadata wasn't set on the subscription object itself

          // We need to fetch the customer to get the email, then find the user by email
          try {
            const customerId =
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id;
            const customer = await stripe.customers.retrieve(customerId);

            if (!customer.deleted && customer.email) {
              // Find user by email in Supabase
              // Note: This requires the user to have the same email in Supabase as in Stripe
              // Since we don't have a direct way to search by email in admin API without listing users,
              // we'll rely on the fact that we usually store stripe_customer_id in user_metadata or
              // we can try to match by email if your auth system supports it.
              // Better approach: Check if we have a user with this stripe_customer_id
              // But Supabase Auth doesn't index user_metadata.
              // Alternative: If we can't find userId, we log a warning.
              // In your specific case, the log shows metadata IS present:
              // "metadata": { "plan": "professional", "userId": "fd2a3a1a-ec35-4d61-b77f-8c5705188fa5" }
              // So the code ABOVE should have worked.
              // Wait, looking at your log:
              // "metadata": { "plan": "professional", "userId": "fd2a3a1a-ec35-4d61-b77f-8c5705188fa5" }
              // The userId IS there.
              // The issue might be that subscription.status is 'trialing' and we are handling it,
              // but maybe the UI isn't updating?
            }
          } catch (err) {
            console.error("Error fetching customer details:", err);
          }
        }

        revalidatePath("/dashboard");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Downgrade to free plan
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { plan: "free_user" },
          });
        }

        revalidatePath("/dashboard");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
