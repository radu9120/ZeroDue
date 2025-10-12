import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Central plan typing and normalization
export type AppPlan = "free_user" | "professional" | "enterprise";

export function normalizePlan(raw: unknown): AppPlan {
  const val = typeof raw === "string" ? raw.toLowerCase().trim() : "";
  if (val === "free_user" || val === "professional" || val === "enterprise") {
    return val as AppPlan;
  }
  // Backward-compat mappings
  if (val === "free") return "free_user";
  if (val === "pro") return "professional";
  if (val === "enterprise") return "enterprise";
  return "free_user";
}
