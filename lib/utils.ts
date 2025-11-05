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

const currencyAliases: Record<string, string> = {
  "BRITISH POUND": "GBP",
  "UK POUND": "GBP",
  POUND: "GBP",
  GBR: "GBP",
  "£": "GBP",
};

export const normalizeCurrencyCode = (raw?: string) => {
  if (!raw) return "GBP";
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  const mapped = currencyAliases[upper] ?? upper;
  return /^[A-Z]{3}$/.test(mapped) ? mapped : "GBP";
};

export const getCurrencySymbol = (raw?: string) => {
  const currencyCode = normalizeCurrencyCode(raw);
  if (currencyCode === "GBP") {
    return "£";
  }

  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency");

    return parts?.value ?? currencyCode;
  } catch (error) {
    console.warn("Currency symbol fallback", { currencyCode, error });
    return currencyCode;
  }
};
