import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { sendCreditsEmail } from "@/lib/emails";
import { EXTRA_INVOICE_PRICES } from "@/lib/stripe";
import { normalizePlan } from "@/lib/utils";

// Initialize Stripe
const stripe =
  process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY
    ? new Stripe(
        process.env.STRIPE_TEST_SECRET_KEY ||
          process.env.STRIPE_LIVE_SECRET_KEY!,
      )
    : null;

// Initialize Supabase Admin
const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      )
    : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required" },
        { status: 400 },
      );
    }

    // 1. Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not succeeded yet" },
        { status: 400 },
      );
    }

    // 2. Check if already processed
    if (paymentIntent.metadata.processed === "true") {
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    // 3. Process the credits
    const type = paymentIntent.metadata.type;
    if (type !== "extra_invoice") {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 },
      );
    }

    const businessId = paymentIntent.metadata.businessId;
    const quantity = parseInt(paymentIntent.metadata.quantity || "1", 10);
    const userId = paymentIntent.metadata.userId;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID missing in metadata" },
        { status: 400 },
      );
    }

    // Add credits to business
    const { data: business, error: fetchError } = await supabaseAdmin
      .from("Businesses")
      .select("extra_invoice_credits")
      .eq("id", parseInt(businessId, 10))
      .single();

    if (fetchError || !business) {
      console.error("Error fetching business:", fetchError);
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    const currentCredits = business.extra_invoice_credits || 0;
    const newCredits = currentCredits + quantity;

    const { error: updateError } = await supabaseAdmin
      .from("Businesses")
      .update({ extra_invoice_credits: newCredits })
      .eq("id", parseInt(businessId, 10));

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 },
      );
    }

    // 4. Mark as processed in Stripe metadata to prevent double-counting
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        processed: "true",
      },
    });

    // 5. Send email (optional, but good practice)
    if (userId) {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (user?.user?.email) {
        const plan = normalizePlan(user.user.user_metadata?.plan);
        const pricePerCredit = EXTRA_INVOICE_PRICES[plan] || 0.99;
        const total = (pricePerCredit * quantity).toFixed(2);

        // Fire and forget email
        sendCreditsEmail(user.user.email, quantity, total, newCredits).catch(
          console.error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      newCredits,
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
