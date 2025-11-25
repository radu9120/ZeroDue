import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { AppPlan } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, subscriptionId } = body as {
      plan: AppPlan;
      subscriptionId?: string;
    };

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const normalizedPlan = normalizePlan(plan);

    // Update the user's plan in metadata
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        plan: normalizedPlan,
        subscription_id: subscriptionId,
        plan_updated_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Failed to update user plan:", error);
      return NextResponse.json(
        { error: "Failed to update plan" },
        { status: 500 }
      );
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
