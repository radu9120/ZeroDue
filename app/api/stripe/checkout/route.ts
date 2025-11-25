import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLAN_CONFIG } from "@/lib/stripe";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, successUrl, cancelUrl } = body as {
      plan: AppPlan;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLAN_CONFIG[plan];

    // Free plan doesn't need checkout
    if (plan === "free_user") {
      return NextResponse.json(
        { error: "Free plan doesn't require payment" },
        { status: 400 }
      );
    }

    // For now, create a checkout session with a fixed price
    // In production, you'd use the actual Stripe price IDs
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `InvoiceFlow ${planConfig.name} Plan`,
              description: `${planConfig.invoicesIncluded === Infinity ? "Unlimited" : planConfig.invoicesIncluded} invoices/month, ${planConfig.businessesIncluded === Infinity ? "Unlimited" : planConfig.businessesIncluded} business profiles`,
            },
            unit_amount: Math.round(planConfig.monthlyPrice * 100), // Convert to cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&plan=${plan}`,
      cancel_url:
        cancelUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId,
        plan,
      },
      client_reference_id: userId,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
