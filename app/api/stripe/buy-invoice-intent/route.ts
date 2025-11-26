import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripeClient, EXTRA_INVOICE_PRICES } from "@/lib/stripe";
import { getCurrentPlan } from "@/lib/plan";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  console.log("[buy-invoice-intent] Starting...");
  
  try {
    const { userId } = await auth();
    console.log("[buy-invoice-intent] userId:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, quantity = 1 } = body as {
      businessId: number;
      quantity?: number;
    };
    
    console.log("[buy-invoice-intent] businessId:", businessId, "quantity:", quantity);

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID required" },
        { status: 400 }
      );
    }

    const plan: AppPlan = await getCurrentPlan();
    console.log("[buy-invoice-intent] plan:", plan);

    // Enterprise users have unlimited invoices
    if (plan === "enterprise") {
      return NextResponse.json(
        { error: "Enterprise plan has unlimited invoices" },
        { status: 400 }
      );
    }

    const pricePerInvoice = EXTRA_INVOICE_PRICES[plan];
    const totalAmount = Math.round(pricePerInvoice * quantity * 100); // Convert to cents
    
    console.log("[buy-invoice-intent] pricePerInvoice:", pricePerInvoice, "totalAmount:", totalAmount);

    // Create a PaymentIntent
    const stripe = getStripeClient();
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
    
    console.log("[buy-invoice-intent] paymentIntent created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error("[buy-invoice-intent] Error:", error?.message, error?.stack);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
