import { auth, currentUser } from "@clerk/nextjs/server";
import { normalizePlan, type AppPlan } from "@/lib/utils";

// Resolves the user's current plan using Clerk Billing's has() helper when available,
// with a safe fallback to publicMetadata.plan
export async function getCurrentPlan(): Promise<AppPlan> {
  try {
    const { has } = await auth();
    // has() may be undefined on older SDKs or when unauthenticated
    if (typeof has === "function") {
      // Check higher tiers first to avoid misclassification
      const [ent, pro] = await Promise.all([
        has({ plan: "enterprise" as any }),
        has({ plan: "professional" as any }),
      ]);
      if (ent) return "enterprise";
      if (pro) return "professional";
      // If neither, assume free
      return "free_user";
    }
  } catch (_) {
    // ignore and fallback
  }
  // Fallback to metadata
  try {
    const user = await currentUser();
    const raw = (user?.publicMetadata as any)?.plan || "free_user";
    return normalizePlan(raw);
  } catch (_) {
    return "free_user";
  }
}
