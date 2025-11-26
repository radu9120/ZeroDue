import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendDowngradeCompletedEmail } from "@/lib/emails";

// Lazy initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(
    process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY!
  );
}

// Lazy initialize Supabase Admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Helper to find user by customer ID or userId in metadata
async function findUserByCustomerOrMetadata(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  customerId: string,
  metadata?: Stripe.Metadata
) {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("[Stripe Webhook] Error listing users:", error);
    return null;
  }

  // First try to find by stripe_customer_id
  let user = users.users.find(
    (u) => u.user_metadata?.stripe_customer_id === customerId
  );

  // If not found and we have userId in metadata, try that
  if (!user && metadata?.userId) {
    user = users.users.find((u) => u.id === metadata.userId);
  }

  return user;
}

export async function POST(request: NextRequest) {
  // Check environment variables first
  if (
    !process.env.STRIPE_TEST_SECRET_KEY &&
    !process.env.STRIPE_LIVE_SECRET_KEY
  ) {
    console.error("[Stripe Webhook] No Stripe secret key configured");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] No webhook secret configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("[Stripe Webhook] Supabase not configured");
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();

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
      case "customer.subscription.created": {
        // New subscription created
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const plan = subscription.metadata?.plan;
        const userId = subscription.metadata?.userId;

        console.log(
          `[Stripe Webhook] Subscription created: ${subscription.id} for customer: ${customerId}, plan: ${plan}`
        );

        if (!userId) {
          console.log(
            "[Stripe Webhook] No userId in subscription metadata, skipping user update"
          );
          break;
        }

        const user = await findUserByCustomerOrMetadata(
          supabaseAdmin,
          customerId,
          subscription.metadata
        );

        if (user) {
          // Update user with subscription info
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              // Only update plan if subscription is active/trialing
              ...(subscription.status === "active" ||
              subscription.status === "trialing"
                ? { plan: plan || user.user_metadata?.plan }
                : {}),
            },
          });
          console.log(
            `[Stripe Webhook] Updated user ${user.email} with subscription ${subscription.id}`
          );
        } else {
          console.warn(
            `[Stripe Webhook] No user found for customer: ${customerId} or userId: ${userId}`
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Subscription has ended (either cancelled or expired)
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(
          `[Stripe Webhook] Subscription deleted for customer: ${customerId}`
        );

        const user = await findUserByCustomerOrMetadata(
          supabaseAdmin,
          customerId,
          subscription.metadata
        );

        if (user) {
          const previousPlan = user.user_metadata?.plan || "Professional";

          // Update user to free plan
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              plan: "free_user",
              subscription_cancel_at_period_end: false,
              subscription_cancel_at: null,
              stripe_subscription_id: null,
            },
          });

          console.log(
            `[Stripe Webhook] User ${user.email} downgraded to free plan`
          );

          // Send downgrade completed email
          if (user.email) {
            try {
              await sendDowngradeCompletedEmail(user.email, previousPlan);
              console.log(
                `[Stripe Webhook] Sent downgrade email to ${user.email}`
              );
            } catch (emailError) {
              console.error(
                "[Stripe Webhook] Failed to send email:",
                emailError
              );
            }
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
        const plan = subscription.metadata?.plan;

        console.log(
          `[Stripe Webhook] Subscription updated for customer: ${customerId}`
        );
        console.log(
          `[Stripe Webhook] Status: ${subscription.status}, Cancel at period end: ${subscription.cancel_at_period_end}, Plan: ${plan}`
        );

        const user = await findUserByCustomerOrMetadata(
          supabaseAdmin,
          customerId,
          subscription.metadata
        );

        if (user) {
          // Get period end from subscription items
          const periodEnd = subscription.items.data[0]?.current_period_end;

          const updateData: Record<string, any> = {
            ...user.user_metadata,
            subscription_cancel_at_period_end:
              subscription.cancel_at_period_end,
            subscription_cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            subscription_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
          };

          // Update plan if subscription is active and we have plan in metadata
          if (
            (subscription.status === "active" ||
              subscription.status === "trialing") &&
            plan
          ) {
            updateData.plan = plan;
          }

          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: updateData,
          });
          console.log(
            `[Stripe Webhook] Updated user ${user.email} subscription status`
          );
        } else {
          console.warn(
            `[Stripe Webhook] No user found for customer: ${customerId}`
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
        // Payment succeeded - update user plan if needed
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(
          `[Stripe Webhook] Payment succeeded for invoice: ${invoice.id}`
        );

        // Get subscription ID from invoice parent
        const subscriptionId =
          (invoice as any).parent?.subscription_details?.subscription ||
          (invoice as any).subscription;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId as string
            );
            const plan = subscription.metadata?.plan;

            if (plan) {
              const user = await findUserByCustomerOrMetadata(
                supabaseAdmin,
                customerId,
                subscription.metadata
              );

              if (user) {
                await supabaseAdmin.auth.admin.updateUserById(user.id, {
                  user_metadata: {
                    ...user.user_metadata,
                    plan: plan,
                    stripe_subscription_id: subscription.id,
                  },
                });
                console.log(
                  `[Stripe Webhook] Updated user ${user.email} plan to ${plan} after payment`
                );
              }
            }
          } catch (subError) {
            console.error(
              "[Stripe Webhook] Error fetching subscription:",
              subError
            );
          }
        }
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
