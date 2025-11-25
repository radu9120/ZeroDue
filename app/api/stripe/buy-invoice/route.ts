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
    const {
      businessId,
      quantity = 1,
      successUrl,
      cancelUrl,
    } = body as {
      businessId: number;
      quantity?: number;
      successUrl?: string;
      cancelUrl?: string;
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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Extra Invoice Credits",
              description: `${quantity} additional invoice${quantity > 1 ? "s" : ""} for your business`,
            },
            unit_amount: Math.round(pricePerInvoice * 100),
          },
          quantity,
        },
      ],
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/new?business_id=${businessId}&credits_added=${quantity}`,
      cancel_url:
        cancelUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/business?business_id=${businessId}`,
      metadata: {
        userId,
        businessId: String(businessId),
        quantity: String(quantity),
        type: "extra_invoice",
      },
      client_reference_id: userId,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe extra invoice checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
