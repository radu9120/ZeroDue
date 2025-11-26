import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendDowngradeCompletedEmail } from "@/lib/emails";

const stripe = new Stripe(
  process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY!,
  { apiVersion: "2025-11-17.clover" }
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.deleted": {
        // Subscription has ended (either cancelled or expired)
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(
          `[Stripe Webhook] Subscription deleted for customer: ${customerId}`
        );

        // Find user by stripe_customer_id in metadata
        const { data: users, error: findError } =
          await supabaseAdmin.auth.admin.listUsers();

        if (findError) {
          console.error("Error listing users:", findError);
          break;
        }

        const user = users.users.find(
          (u) => u.user_metadata?.stripe_customer_id === customerId
        );

        if (user) {
          const previousPlan = user.user_metadata?.plan || "Professional";

          // Update user to free plan
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              plan: "free_user",
              subscription_cancel_at_period_end: false,
              stripe_subscription_id: null,
            },
          });

          console.log(
            `[Stripe Webhook] User ${user.email} downgraded to free plan`
          );

          // Send downgrade completed email
          if (user.email) {
            await sendDowngradeCompletedEmail(user.email, previousPlan);
            console.log(
              `[Stripe Webhook] Sent downgrade email to ${user.email}`
            );
          }
        } else {
          console.warn(
            `[Stripe Webhook] No user found for customer: ${customerId}`
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        // Subscription was updated (could be reactivation, plan change, etc.)
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(
          `[Stripe Webhook] Subscription updated for customer: ${customerId}`
        );
        console.log(
          `[Stripe Webhook] Status: ${subscription.status}, Cancel at period end: ${subscription.cancel_at_period_end}`
        );

        // Find user by stripe_customer_id
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users?.users.find(
          (u) => u.user_metadata?.stripe_customer_id === customerId
        );

        if (user) {
          // Update cancel_at_period_end status
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              subscription_cancel_at_period_end:
                subscription.cancel_at_period_end,
            },
          });
          console.log(
            `[Stripe Webhook] Updated user ${user.email} subscription status`
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        // Payment failed
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(
          `[Stripe Webhook] Payment failed for customer: ${customerId}`
        );
        // You could send a payment failed email here
        break;
      }

      case "invoice.payment_succeeded": {
        // Payment succeeded
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          `[Stripe Webhook] Payment succeeded for invoice: ${invoice.id}`
        );
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
