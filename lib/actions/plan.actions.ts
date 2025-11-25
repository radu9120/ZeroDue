"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppPlan, normalizePlan } from "@/lib/utils";
import { auth, updateUserMetadata } from "@/lib/auth";

export async function setUserPlan(plan: AppPlan, redirectTo?: string) {
  const jar = await cookies();
  // Store both new and legacy for compatibility in any lingering code paths
  const normalized = normalizePlan(plan);
  const legacy =
    normalized === "free_user"
      ? "free"
      : normalized === "professional"
        ? "pro"
        : "enterprise";
  jar.set("user_plan", normalized, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  jar.set("user_plan_legacy", legacy, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  if (redirectTo) redirect(redirectTo);
}

export async function setSupabasePlan(plan: AppPlan, redirectTo?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const normalized = normalizePlan(plan);

  // Update user metadata in Supabase
  await updateUserMetadata({ plan: normalized });

  // Keep cookies in sync for any legacy reads
  const jar = await cookies();
  const legacy =
    normalized === "free_user"
      ? "free"
      : normalized === "professional"
        ? "pro"
        : "enterprise";
  jar.set("user_plan", normalized, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  jar.set("user_plan_legacy", legacy, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  if (redirectTo) redirect(redirectTo);
}

// Keep for backwards compatibility
export const setClerkPlan = setSupabasePlan;
