import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, EXTRA_INVOICE_PRICES } from "@/lib/stripe";
import { getCurrentPlan } from "@/lib/plan";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, quantity = 1 } = body as {
      businessId: number;
      quantity?: number;
    };

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID required" },
        { status: 400 }
      );
    }

    const plan: AppPlan = await getCurrentPlan();

    // Enterprise users have unlimited invoices
    if (plan === "enterprise") {
      return NextResponse.json(
        { error: "Enterprise plan has unlimited invoices" },
        { status: 400 }
      );
    }

    const pricePerInvoice = EXTRA_INVOICE_PRICES[plan];
    const totalAmount = Math.round(pricePerInvoice * quantity * 100); // Convert to cents

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        businessId: String(businessId),
        quantity: String(quantity),
        type: "extra_invoice",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error("Stripe payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
