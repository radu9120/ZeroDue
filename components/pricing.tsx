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
  Calendar,
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
    features: [
      "2 invoices",
      "1 business",
      "Basic templates",
      "PDF export",
      "Pay as you go",
    ],
    excluded: ["Recurring invoices", "Estimates & quotes", "Expense tracking"],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-slate-500 to-slate-600",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$6.99",
    period: "/mo",
    yearlyNote: "or $67/year ($5.58/mo)",
    description: "Small businesses",
    icon: Rocket,
    features: [
      "15 invoices/mo",
      "3 businesses",
      "All templates",
      "Recurring invoices",
      "Estimates & quotes",
      "Expense tracking",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free 30 Days Trial",
    trialNote: "30-day free trial • Cancel anytime",
    popular: true,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$15.99",
    period: "/mo",
    yearlyNote: "or $149.99/year ($12.50/mo)",
    description: "Growing businesses",
    icon: Crown,
    features: [
      "Unlimited invoices",
      "Unlimited businesses",
      "All templates + custom branding",
      "Recurring invoices",
      "Estimates & quotes",
      "Expense tracking",
      "Partial payments",
      "Payment reminders",
      "Email tracking",
      "Priority support",
    ],
    cta: "Start Free 30 Days Trial",
    trialNote: "30-day free trial • Cancel anytime",
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
          ? "Your 30-day free trial has started!"
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
            ? `${planPrice}/month after 30-day free trial`
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
          ? "Your card won't be charged until after the 30-day trial. Cancel anytime."
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [checkoutPlan, setCheckoutPlan] = useState<{
    id: string;
    name: string;
    price: string;
    clientSecret: string;
    subscriptionId: string;
    hasTrial: boolean;
    billingPeriod?: "monthly" | "yearly";
  } | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [cancellationScheduled, setCancellationScheduled] = useState<{
    periodEnd: string;
  } | null>(null);
  const [cancellationSuccess, setCancellationSuccess] = useState<{
    periodEnd: string;
    planName: string;
  } | null>(null);

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

          // Check if cancellation is already scheduled
          if (
            user.user_metadata?.subscription_cancel_at_period_end &&
            user.user_metadata?.subscription_period_end
          ) {
            setCancellationScheduled({
              periodEnd: new Date(
                user.user_metadata.subscription_period_end
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            });
          }
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

      // Close downgrade modal and show success modal
      setShowDowngradeModal(false);

      // Format the period end date
      const periodEndDate = data.periodEnd
        ? new Date(data.periodEnd).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "the end of your billing period";

      // Update cancellation scheduled state immediately
      setCancellationScheduled({
        periodEnd: periodEndDate,
      });

      setCancellationSuccess({
        periodEnd: periodEndDate,
        planName: currentPlan === "enterprise" ? "Enterprise" : "Professional",
      });
    } catch {
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleReactivate = async () => {
    if (!isAuthenticated) return;

    setLoading("reactivate");
    try {
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data.message || "Subscription reactivated!");
      setCancellationScheduled(null);
    } catch {
      toast.error("Failed to reactivate subscription. Please try again.");
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
        body: JSON.stringify({ plan: planId, billingPeriod }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Handle instant upgrade (no payment needed - already has payment method)
      if (data.upgraded) {
        toast.success(data.message || "Successfully upgraded!");
        setCurrentPlan(planId);
        router.refresh();
        return;
      }

      if (data.clientSecret) {
        setCheckoutPlan({
          id: planId,
          name: plan.name,
          price:
            billingPeriod === "monthly"
              ? plan.price
              : plan.yearlyNote?.split(" ")[1] || plan.price,
          clientSecret: data.clientSecret,
          subscriptionId: data.subscriptionId || "",
          hasTrial: data.hasTrial !== false, // default to true if not specified
          billingPeriod,
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

      {/* Cancellation Success Modal */}
      <AnimatePresence>
        {cancellationSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header with calendar icon */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Cancellation Scheduled
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Your{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {cancellationSuccess.planName}
                    </span>{" "}
                    subscription has been scheduled for cancellation.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      You&apos;ll keep full access until:
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {cancellationSuccess.periodEnd}
                    </p>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    After this date, your account will switch to the Free plan.
                    You can reactivate anytime before then.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCancellationSuccess(null);
                      router.refresh();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                  >
                    Got it
                  </button>
                </div>

                <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
                  We&apos;ve also sent a confirmation email to your inbox.
                </p>
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

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm rounded-full p-1 flex items-center gap-1 border border-slate-200 dark:border-slate-700/50">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/25"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Yearly
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  billingPeriod === "yearly"
                    ? "bg-white/20 text-white"
                    : "bg-green-500/20 text-green-600 dark:text-green-400"
                }`}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`grid gap-6 lg:gap-8 pt-8 ${
            isDashboard
              ? "grid-cols-1 lg:grid-cols-3"
              : "grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto"
          }`}
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;

            // Calculate price based on billing period
            let displayPrice = plan.price;
            let displayPeriod = plan.period;

            if (plan.id !== "free_user") {
              if (billingPeriod === "yearly") {
                // Extract yearly price from yearlyNote "or $67/year" or "or $149.99/year"
                const yearlyMatch = plan.yearlyNote?.match(/\$([\d.]+)\/year/);
                if (yearlyMatch) {
                  displayPrice = `$${yearlyMatch[1]}`;
                  displayPeriod = "/year";
                }
              }
            }

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
                onClick={() => !isCurrentPlan && handleCheckout(plan.id)}
                className={`relative flex flex-col rounded-3xl transition-all duration-200 ${
                  isCurrentPlan
                    ? "cursor-default"
                    : "cursor-pointer hover:scale-[1.03]"
                } ${
                  plan.popular
                    ? "border-2 border-blue-500 dark:border-blue-400 bg-slate-900 dark:bg-slate-800 shadow-lg shadow-blue-500/20 scale-[1.02]"
                    : "border border-slate-700 bg-slate-900/80 dark:bg-slate-800/80 hover:border-slate-600"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/20 tracking-wide uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={`p-6 lg:p-10 ${plan.popular ? "pt-10 lg:pt-14" : ""}`}
                >
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div
                      className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs lg:text-sm text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 lg:mb-8">
                    <div className="flex items-baseline gap-1 lg:gap-2">
                      <span className="text-4xl lg:text-5xl font-bold text-white">
                        {displayPrice}
                      </span>
                      <span className="text-base lg:text-lg text-slate-400">
                        {displayPeriod}
                      </span>
                    </div>
                    {plan.yearlyNote && billingPeriod === "monthly" && (
                      <p className="text-xs lg:text-sm text-slate-500 mt-1">
                        {plan.yearlyNote}
                      </p>
                    )}
                    {billingPeriod === "yearly" && plan.id !== "free_user" && (
                      <p className="text-xs lg:text-sm text-green-400 mt-1">
                        Save 20% with yearly billing
                      </p>
                    )}
                    {/* Trial note for paid plans */}
                    {(plan as any).trialNote && plan.id !== "free_user" && (
                      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        {(plan as any).trialNote}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 lg:gap-3 text-sm lg:text-base text-slate-300"
                      >
                        <div
                          className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}
                        >
                          <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                        </div>
                        {feature}
                      </li>
                    ))}
                    {/* Show excluded features for free plan */}
                    {(plan as any).excluded?.map((feature: string) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 lg:gap-3 text-sm lg:text-base text-slate-500"
                      >
                        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <X className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-slate-500" />
                        </div>
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  {plan.id === "free_user" && cancellationScheduled ? (
                    // Show both info and reactivate button when cancellation is scheduled
                    <div className="space-y-2">
                      <div className="w-full py-3 px-4 rounded-xl bg-orange-500/20 border border-orange-500/30 text-center">
                        <span className="flex items-center justify-center gap-2 text-sm text-orange-300">
                          <Calendar className="w-4 h-4" />
                          Switching {cancellationScheduled.periodEnd}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivate();
                        }}
                        disabled={loading === "reactivate"}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-green-600 hover:bg-green-500 text-white transition-all disabled:opacity-50"
                      >
                        {loading === "reactivate" ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            Keep My Plan Instead
                          </span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckout(plan.id);
                      }}
                      disabled={loading === plan.id || currentPlan === plan.id}
                      className={`w-full py-3 lg:py-4 px-4 lg:px-6 rounded-xl font-semibold text-sm lg:text-base transition-all disabled:opacity-50 cursor-pointer ${
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
                  )}
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
