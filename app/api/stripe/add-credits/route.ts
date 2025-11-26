import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { sendCreditsEmail } from "@/lib/emails";
import { EXTRA_INVOICE_PRICES } from "@/lib/stripe";
import { getCurrentPlan } from "@/lib/plan";

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

    const supabase = createSupabaseClient();

    // Get current credits
    const { data: business, error: fetchError } = await supabase
      .from("Businesses")
      .select("extra_invoice_credits")
      .eq("id", businessId)
      .eq("author", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching business:", fetchError);
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const currentCredits = business?.extra_invoice_credits || 0;
    const newCredits = currentCredits + quantity;

    // Update credits
    const { error: updateError } = await supabase
      .from("Businesses")
      .update({ extra_invoice_credits: newCredits })
      .eq("id", businessId)
      .eq("author", userId);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      const serverSupabase = await createClient();
      const {
        data: { user },
      } = await serverSupabase.auth.getUser();

      if (user?.email) {
        const plan = await getCurrentPlan();
        const pricePerCredit = EXTRA_INVOICE_PRICES[plan] || 0.99;
        const total = (pricePerCredit * quantity).toFixed(2);

        await sendCreditsEmail(user.email, quantity, total, newCredits);
      }
    } catch (emailError) {
      console.error("Failed to send credits email:", emailError);
    }

    return NextResponse.json({
      success: true,
      credits: newCredits,
      message: `Successfully added ${quantity} invoice credit${quantity > 1 ? "s" : ""}`,
    });
  } catch (error: any) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add credits" },
      { status: 500 }
    );
  }
}
