"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Zap,
  Crown,
  Rocket,
  X,
  CreditCard,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface PricingProps {
  showTitle?: boolean;
  showBackground?: boolean;
  isDashboard?: boolean;
}

// Lazy load Stripe to avoid errors when env var is missing
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

const plans = [
  {
    id: "free_user",
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Getting started",
    icon: Zap,
    features: ["2 invoices", "1 business", "Basic templates", "PDF export"],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-slate-500 to-slate-600",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$6.99",
    period: "/mo",
    yearlyNote: "or $70/year ($5.83/mo)",
    description: "Small businesses",
    icon: Rocket,
    features: [
      "15 invoices/mo",
      "3 businesses",
      "All templates",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free 60 Days Trial",
    popular: true,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$15.99",
    period: "/mo",
    yearlyNote: "or $192/year ($16/mo)",
    description: "Growing businesses",
    icon: Crown,
    features: [
      "Unlimited invoices",
      "Unlimited businesses",
      "All templates + custom branding",
      "Email tracking & reminders",
      "Priority support",
    ],
    cta: "Start Free 60 Days Trial",
    popular: false,
    gradient: "from-purple-600 to-pink-500",
  },
];

function CheckoutForm({
  planName,
  planPrice,
  planId,
  subscriptionId,
  onSuccess,
  onCancel,
  hasTrial = true,
}: {
  planName: string;
  planPrice: string;
  planId: string;
  subscriptionId: string;
  onSuccess: () => void;
  onCancel: () => void;
  hasTrial?: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    // Use confirmSetup for trial (SetupIntent) or confirmPayment for immediate charge
    const confirmResult = hasTrial
      ? await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard?checkout=success`,
          },
          redirect: "if_required",
        })
      : await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard?checkout=success`,
          },
          redirect: "if_required",
        });

    if (confirmResult.error) {
      setError(confirmResult.error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      // Update the user's plan immediately after successful setup
      try {
        const response = await fetch("/api/stripe/confirm-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planId, subscriptionId }),
        });

        if (!response.ok) {
          console.error("Failed to confirm subscription");
        }
      } catch (err) {
        console.error("Error confirming subscription:", err);
      }

      toast.success(
        hasTrial
          ? "Your 60-day free trial has started!"
          : "Subscription activated successfully!"
      );
      // Force a full page reload to refresh all cached data
      window.location.href = "/dashboard?checkout=success";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {planName} Plan
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {hasTrial
            ? `${planPrice}/month after 60-day free trial`
            : `${planPrice}/month - billed immediately`}
        </p>
      </div>

      <PaymentElement
        options={{
          layout: "accordion",
          wallets: { applePay: "auto", googlePay: "auto" },
          paymentMethodOrder: ["apple_pay", "google_pay", "card"],
        }}
      />

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              {hasTrial ? "Start Trial" : "Subscribe Now"}
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
        {hasTrial
          ? "Your card won't be charged until after the 60-day trial. Cancel anytime."
          : "Your card will be charged immediately. Cancel anytime."}
      </p>
    </form>
  );
}

export default function Pricing({
  showTitle = true,
  showBackground = true,
  isDashboard = false,
}: PricingProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<{
    id: string;
    name: string;
    price: string;
    clientSecret: string;
    subscriptionId: string;
    hasTrial: boolean;
  } | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Fetch current plan and trial status if authenticated
      if (user) {
        try {
          const [planResponse, trialResponse] = await Promise.all([
            fetch("/api/plan"),
            fetch("/api/plan/trial-status"),
          ]);
          const planData = await planResponse.json();
          const trialData = await trialResponse.json();
          setCurrentPlan(planData.plan || "free_user");
          setHasUsedTrial(trialData.hasUsedTrial || false);
        } catch {
          setCurrentPlan("free_user");
          setHasUsedTrial(false);
        }
      }
    };
    checkAuth();

    // Check dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleDowngrade = async () => {
    if (!isAuthenticated) return;

    setLoading("free_user");
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Show success message with period end date
      toast.success(data.message || "Subscription cancellation scheduled!");
      setShowDowngradeModal(false);
      // Refresh to update the UI
      window.location.href = "/dashboard?plan=cancellation-scheduled";
    } catch {
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCheckout = async (planId: string) => {
    if (planId === "free_user") {
      setLoading("free_user");
      // If user is on a paid plan, show downgrade modal
      if (
        isAuthenticated === true &&
        currentPlan &&
        currentPlan !== "free_user"
      ) {
        setLoading(null);
        setShowDowngradeModal(true);
        return;
      }
      // If auth state is still loading or user is not authenticated, go to sign-up
      if (isAuthenticated === true) {
        // User is logged in, go to dashboard
        window.location.href = "/dashboard";
      } else {
        // User is not logged in or auth is still loading, go to sign-up
        window.location.href = "/sign-up";
      }
      return;
    }

    if (!isAuthenticated) {
      router.push("/sign-up");
      return;
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setLoading(planId);
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.clientSecret) {
        setCheckoutPlan({
          id: planId,
          name: plan.name,
          price: plan.price,
          clientSecret: data.clientSecret,
          subscriptionId: data.subscriptionId || "",
          hasTrial: data.hasTrial !== false, // default to true if not specified
        });
      }
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section
      id="pricing"
      className={`${showTitle ? "py-24 sm:py-32" : "py-0"} relative overflow-hidden`}
    >
      {showBackground && (
        <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-slate-950" />
      )}

      {/* Downgrade Confirmation Modal */}
      <AnimatePresence>
        {showDowngradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDowngradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header with warning icon */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Cancel Subscription?
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                  You&apos;ll keep your{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentPlan === "enterprise"
                      ? "Enterprise"
                      : "Professional"}
                  </span>{" "}
                  features until the end of your current billing period, then
                  switch to the Free Plan.
                </p>

                {/* What you'll lose */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
                    What you&apos;ll lose at period end:
                  </p>
                  <ul className="space-y-2">
                    {currentPlan === "enterprise" ? (
                      <>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> Unlimited invoices
                        </li>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> Unlimited businesses
                        </li>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> Email tracking & reminders
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> 15 invoices per month
                        </li>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> 3 businesses
                        </li>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> Custom branding
                        </li>
                      </>
                    )}
                    <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <X className="w-4 h-4" /> Priority support
                    </li>
                  </ul>
                </div>

                {/* What you'll keep */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">
                    What you&apos;ll keep:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" /> 2 invoices per month
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" /> 1 business
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" /> Basic templates
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" /> PDF export
                    </li>
                  </ul>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDowngradeModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Keep My Plan
                  </button>
                  <button
                    onClick={() => {
                      setShowDowngradeModal(false);
                      handleDowngrade();
                    }}
                    disabled={loading === "free_user"}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {loading === "free_user" ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Cancel Subscription"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setCheckoutPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setCheckoutPlan(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret: checkoutPlan.clientSecret,
                  appearance: {
                    theme: isDarkMode ? "night" : "stripe",
                    variables: {
                      colorPrimary: "#2563eb",
                      borderRadius: "12px",
                      fontFamily: "system-ui, sans-serif",
                      colorBackground: isDarkMode ? "#0f172a" : "#ffffff",
                      colorText: isDarkMode ? "#e2e8f0" : "#1e293b",
                      colorTextSecondary: isDarkMode ? "#94a3b8" : "#64748b",
                      colorDanger: "#ef4444",
                    },
                    rules: {
                      ".Input": {
                        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                        border: isDarkMode
                          ? "1px solid #334155"
                          : "1px solid #e2e8f0",
                        color: isDarkMode ? "#e2e8f0" : "#1e293b",
                      },
                      ".Input:focus": {
                        border: "1px solid #2563eb",
                        boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.2)",
                      },
                      ".Label": {
                        color: isDarkMode ? "#cbd5e1" : "#475569",
                        fontWeight: "500",
                      },
                      ".Tab": {
                        backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
                        border: isDarkMode
                          ? "1px solid #334155"
                          : "1px solid #e2e8f0",
                        color: isDarkMode ? "#e2e8f0" : "#1e293b",
                      },
                      ".Tab--selected": {
                        backgroundColor: isDarkMode ? "#2563eb" : "#2563eb",
                        borderColor: "#2563eb",
                        color: "#ffffff",
                      },
                      ".TabIcon": {
                        fill: isDarkMode ? "#94a3b8" : "#64748b",
                      },
                      ".TabIcon--selected": {
                        fill: "#ffffff",
                      },
                    },
                  },
                }}
              >
                <CheckoutForm
                  planName={checkoutPlan.name}
                  planPrice={checkoutPlan.price}
                  planId={checkoutPlan.id}
                  subscriptionId={checkoutPlan.subscriptionId}
                  hasTrial={checkoutPlan.hasTrial}
                  onSuccess={() => {
                    setCheckoutPlan(null);
                    router.push("/dashboard?checkout=success");
                  }}
                  onCancel={() => setCheckoutPlan(null)}
                />
              </Elements>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`${isDashboard ? "w-full" : "container mx-auto px-4"} relative z-10`}
      >
        {showTitle && (
          <div className="text-center mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              Pay-as-you-go Pricing
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-bold mb-6 text-slate-900 dark:text-white"
            >
              Start Free,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Scale as You Grow
              </span>
            </motion.h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              2 free invoices. Pay only for what you use.
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`grid gap-8 pt-8 ${
            isDashboard
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto"
          }`}
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
                onClick={() => handleCheckout(plan.id)}
                className={`relative flex flex-col rounded-3xl transition-all duration-200 cursor-pointer hover:scale-[1.03] ${
                  plan.popular
                    ? "border-2 border-blue-500 dark:border-blue-400 bg-slate-900 dark:bg-slate-900 shadow-lg shadow-blue-500/20 scale-[1.02]"
                    : "border border-slate-700 bg-slate-900/80 dark:bg-slate-900/80 hover:border-slate-600"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/20 tracking-wide uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`p-10 ${plan.popular ? "pt-14" : ""}`}>
                  {/* Icon & Name */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-lg text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                    {plan.yearlyNote && (
                      <p className="text-sm text-slate-500 mt-1">
                        {plan.yearlyNote}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-base text-slate-300"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckout(plan.id);
                    }}
                    disabled={loading === plan.id || currentPlan === plan.id}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all disabled:opacity-50 cursor-pointer ${
                      currentPlan === plan.id
                        ? "bg-green-600 text-white cursor-default"
                        : plan.id === "free_user" &&
                            currentPlan &&
                            currentPlan !== "free_user"
                          ? "bg-orange-600 hover:bg-orange-500 text-white"
                          : plan.popular
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02]"
                            : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : currentPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Current Plan
                      </span>
                    ) : plan.id === "free_user" &&
                      currentPlan &&
                      currentPlan !== "free_user" ? (
                      "Downgrade to Free"
                    ) : plan.id !== "free_user" && hasUsedTrial ? (
                      // User has already used trial - show regular subscribe
                      `Subscribe to ${plan.name}`
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400"
        >
          <span className="text-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" /> No card for free plan
          </span>
          <span className="text-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" /> Secure via Stripe
          </span>
          <span className="text-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" /> Cancel anytime
          </span>
        </motion.div>
      </div>
    </section>
  );
}
