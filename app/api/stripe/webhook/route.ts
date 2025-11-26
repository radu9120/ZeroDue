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
