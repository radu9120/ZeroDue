import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ plan: "free_user", userId: null });
    }

    // Use admin client to get fresh user data (bypasses session cache)
    const supabase = createSupabaseAdminClient();
    const { data: userData, error } =
      await supabase.auth.admin.getUserById(userId);

    if (error || !userData?.user) {
      return NextResponse.json({ plan: "free_user", userId });
    }

    const plan = normalizePlan(
      userData.user.user_metadata?.plan || "free_user"
    );

    return NextResponse.json({ plan, userId });
  } catch (e) {
    return NextResponse.json(
      { plan: "free_user", userId: null },
      { status: 200 }
    );
  }
}
