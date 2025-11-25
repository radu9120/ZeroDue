import Stripe from "stripe";

// Use test keys by default, switch to live in production
const isProduction = process.env.NODE_ENV === "production";

export const stripe = new Stripe(
  isProduction
    ? process.env.STRIPE_LIVE_SECRET_KEY!
    : process.env.STRIPE_TEST_SECRET_KEY!,
  {
    apiVersion: "2025-11-17.clover",
    typescript: true,
  }
);

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
