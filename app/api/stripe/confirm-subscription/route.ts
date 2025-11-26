import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { sendPlanUpgradeEmail } from "@/lib/emails";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      plan,
      subscriptionId,
      hasTrial = true,
    } = body as {
      plan: AppPlan;
      subscriptionId?: string;
      hasTrial?: boolean;
    };

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const normalizedPlan = normalizePlan(plan);

    // Get user details for email
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email;

    // Update the user's plan in metadata
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        plan: normalizedPlan,
        subscription_id: subscriptionId,
        plan_updated_at: new Date().toISOString(),
        has_used_trial: true, // Mark trial as used
      },
    });

    if (error) {
      console.error("Failed to update user plan:", error);
      return NextResponse.json(
        { error: "Failed to update plan" },
        { status: 500 }
      );
    }

    // Send plan upgrade email
    if (userEmail) {
      try {
        const planName =
          normalizedPlan === "enterprise" ? "Enterprise" : "Professional";
        const trialEndDate = hasTrial
          ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          : undefined; // 60 days from now
        await sendPlanUpgradeEmail(userEmail, planName, hasTrial, trialEndDate);
      } catch (emailError) {
        console.error("Failed to send plan upgrade email:", emailError);
      }
    }

    // Revalidate all dashboard paths to pick up the new plan
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/business");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/plan");

    return NextResponse.json({
      success: true,
      plan: normalizedPlan,
    });
  } catch (error: any) {
    console.error("Confirm subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm subscription" },
      { status: 500 }
    );
  }
}
