import Stripe from "stripe";

// Check for test mode flag or use production setting
const useTestMode = process.env.STRIPE_USE_TEST_MODE === "true";
const isProduction = process.env.NODE_ENV === "production" && !useTestMode;

// Lazy initialize Stripe to avoid build-time errors when env var is not set
let stripeInstance: Stripe | null = null;
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    // Always prefer test key if available and not explicitly in production
    const secretKey =
      process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        "No Stripe secret key found. Set STRIPE_TEST_SECRET_KEY or STRIPE_LIVE_SECRET_KEY"
      );
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility, export stripe as a getter
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeClient() as any)[prop];
  },
});

// Plan configuration with Stripe price IDs
// You'll need to create these products/prices in Stripe Dashboard
export const PLAN_CONFIG = {
  free_user: {
    name: "Free",
    invoicesIncluded: 2,
    businessesIncluded: 1,
    pricePerExtraInvoice: 0.99,
    monthlyPrice: 0,
    // No stripe price ID needed for free
  },
  professional: {
    name: "Professional",
    invoicesIncluded: 15,
    businessesIncluded: 3,
    pricePerExtraInvoice: 0.49,
    monthlyPrice: 6.99,
    yearlyPrice: 70, // $5.83/mo if paid yearly
    // Set these after creating products in Stripe Dashboard
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  },
  enterprise: {
    name: "Enterprise",
    invoicesIncluded: Infinity,
    businessesIncluded: Infinity,
    pricePerExtraInvoice: 0,
    monthlyPrice: 15.99,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
} as const;

// Extra invoice pricing (one-time payment)
export const EXTRA_INVOICE_PRICES = {
  free_user: 0.99,
  professional: 0.49,
  enterprise: 0, // Unlimited, no extra charge
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;
