import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Cancel subscriptions at period end (not immediately)
    let periodEndDate: Date | null = null;
    for (const subscription of allSubscriptions) {
      const updatedSub = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      // Get the period end date from the updated subscription
      if (!periodEndDate && updatedSub.current_period_end) {
        periodEndDate = new Date(updatedSub.current_period_end * 1000);
      }
    }

    // Fallback: if no period end found, use 30 days from now
    if (!periodEndDate || isNaN(periodEndDate.getTime())) {
      periodEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Update user metadata to indicate scheduled cancellation
    await supabase.auth.updateUser({
      data: {
        subscription_cancel_at_period_end: true,
        subscription_period_end: periodEndDate.toISOString(),
        // Note: We keep the current plan until the period ends
        // The webhook will handle the actual downgrade when the subscription ends
      },
    });

    // Send downgrade scheduled email
    if (user.email) {
      const planName =
        currentPlan === "enterprise" ? "Enterprise" : "Professional";
      const formattedDate = periodEndDate?.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await resend.emails.send({
        from: "InvoiceFlow <noreply@invcyflow.com>",
        to: user.email,
        subject: "Your subscription cancellation is scheduled",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">InvoiceFlow</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 12px 0; color: #92400e;">Subscription Cancellation Scheduled</h2>
              <p style="margin: 0; color: #78350f;">
                Your ${planName} plan will remain active until <strong>${formattedDate}</strong>.
              </p>
            </div>
            
            <p>Hi there,</p>
            
            <p>We've received your request to cancel your ${planName} subscription. Here's what you need to know:</p>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #334155;">What happens next:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 8px;">You'll continue to have full access to ${planName} features until ${formattedDate}</li>
                <li style="margin-bottom: 8px;">After that date, your account will switch to the Free plan</li>
                <li style="margin-bottom: 8px;">You'll keep access to 2 invoices per month and 1 business</li>
                <li>All your existing invoices and data will be preserved</li>
              </ul>
            </div>
            
            <p>Changed your mind? You can reactivate your subscription anytime before ${formattedDate} from your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #2563eb;">account settings</a>.</p>
            
            <p>We'd love to hear your feedback on why you're leaving. Just reply to this email!</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The InvoiceFlow Team</strong>
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
              <p>© ${new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Your subscription will be cancelled on ${periodEndDate?.toLocaleDateString()}. You'll keep ${currentPlan === "enterprise" ? "Enterprise" : "Professional"} access until then.`,
      periodEnd: periodEndDate?.toISOString(),
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
