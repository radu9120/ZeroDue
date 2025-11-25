import { currentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan, type AppPlan } from "@/lib/utils";
import { auth } from "@/lib/auth";

// Resolves the user's current plan using Supabase user metadata
export async function getCurrentPlan(): Promise<AppPlan> {
  try {
    const { userId } = await auth();
    if (!userId) return "free_user";

    // Use admin client to get the latest user data (bypasses session cache)
    const supabase = createSupabaseAdminClient();
    const { data: userData, error } =
      await supabase.auth.admin.getUserById(userId);

    if (error || !userData?.user) {
      // Fallback to session-based user
      const user = await currentUser();
      if (!user) return "free_user";
      const raw = (user.publicMetadata as any)?.plan || "free_user";
      return normalizePlan(raw);
    }

    // Get plan from user_metadata
    const raw = userData.user.user_metadata?.plan || "free_user";
    return normalizePlan(raw);
  } catch (_) {
    return "free_user";
  }
}
