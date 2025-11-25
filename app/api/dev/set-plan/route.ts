import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan, type AppPlan } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_DEV_SET_PLAN !== "true") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const { plan } = await req.json().catch(() => ({ plan: "" }));
  const p = normalizePlan(plan as string);
  if (!p) return new NextResponse("Bad Request", { status: 400 });

  // Update user metadata in Supabase
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { plan: p as AppPlan },
  });

  if (error) {
    console.error("Failed to update user plan:", error);
    return new NextResponse("Failed to update plan", { status: 500 });
  }

  return NextResponse.json({ ok: true, plan: p });
}
