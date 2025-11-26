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
    monthlyPrice: "$0",
    yearlyPrice: "$0",
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
    monthlyPrice: "$6.99",
    yearlyPrice: "$70",
    yearlySavings: "Save $14/year",
    period: "/mo",
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
    monthlyPrice: "$15.99",
    yearlyPrice: "$192",
    yearlySavings: "Save $0/year",
    period: "/mo",
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

export default function DashboardPricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
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

    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleDowngrade = async () => {
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

      setShowDowngradeModal(false);

      const periodEndDate = data.periodEnd
        ? new Date(data.periodEnd).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "the end of your billing period";

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
      if (currentPlan && currentPlan !== "free_user") {
        setShowDowngradeModal(true);
        return;
      }
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
          price: billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
          clientSecret: data.clientSecret,
          subscriptionId: data.subscriptionId || "",
          hasTrial: data.hasTrial !== false,
        });
      }
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full">
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
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Cancel Subscription?
                </h3>
              </div>

              <div className="p-6">
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                  You&apos;ll keep your{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentPlan === "enterprise"
                      ? "Enterprise"
                      : "Professional"}
                  </span>{" "}
                  features until the end of your current billing period.
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
                    What you&apos;ll lose:
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
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> 15 invoices per month
                        </li>
                        <li className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" /> 3 businesses
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDowngradeModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Keep My Plan
                  </button>
                  <button
                    onClick={handleDowngrade}
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
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Cancellation Scheduled
                </h3>
              </div>

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
                </div>

                <button
                  onClick={() => {
                    setCancellationSuccess(null);
                    router.refresh();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Got it
                </button>
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

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-white" : "text-slate-400"}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingPeriod === "yearly" ? "bg-green-500" : "bg-slate-600"
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
              billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingPeriod === "yearly" ? "text-white" : "text-slate-400"}`}>
          Yearly
        </span>
        {billingPeriod === "yearly" && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            Save up to 17%
          </span>
        )}
      </div>

      {/* Mobile-First Plan Cards */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isCancelling = plan.id === "free_user" && cancellationScheduled;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
                isCurrentPlan
                  ? "ring-2 ring-green-500 bg-slate-800"
                  : plan.popular
                    ? "ring-2 ring-blue-500 bg-slate-800"
                    : "bg-slate-800/60 hover:bg-slate-800"
              } ${!isCurrentPlan && !isCancelling ? "cursor-pointer active:scale-[0.98]" : ""}`}
              onClick={() =>
                !isCurrentPlan && !isCancelling && handleCheckout(plan.id)
              }
            >
              {plan.popular && !isCurrentPlan && (
                <span className="absolute -top-2.5 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Popular
                </span>
              )}

              {/* Mobile Layout - Stacked */}
              <div className="flex flex-col gap-4">
                {/* Top Row: Icon, Name, Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-lg">
                          {plan.name}
                        </h3>
                        {isCurrentPlan && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </div>
                    <div className="text-xs text-slate-400">
                      {billingPeriod === "monthly" ? plan.period : "/year"}
                    </div>
                    {billingPeriod === "monthly" && plan.yearlySavings && (
                      <div className="text-[10px] text-green-400 mt-0.5">
                        {plan.yearlySavings}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features Row */}
                <div className="flex flex-wrap gap-2">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded-full"
                    >
                      <Check className="w-3 h-3 text-green-400" />
                      {feature}
                    </span>
                  ))}
                  {plan.features.length > 3 && (
                    <span className="text-xs text-slate-500 px-2 py-1">
                      +{plan.features.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action Button - Full Width on Mobile */}
                <div className="w-full">
                  {isCancelling ? (
                    <div className="flex flex-col gap-2">
                      <div className="py-2.5 px-4 rounded-xl bg-orange-500/20 border border-orange-500/30 text-center">
                        <span className="text-xs text-orange-300 font-medium block">
                          Ends {cancellationScheduled?.periodEnd || "soon"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivate();
                        }}
                        disabled={loading === "reactivate"}
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                      >
                        {loading === "reactivate" ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          "Keep Plan"
                        )}
                      </button>
                    </div>
                  ) : isCurrentPlan ? (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/20 text-green-400 font-semibold">
                      <Check className="w-5 h-5" />
                      <span>Active Plan</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckout(plan.id);
                      }}
                      disabled={loading === plan.id}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                        plan.id === "free_user" &&
                        currentPlan &&
                        currentPlan !== "free_user"
                          ? "bg-orange-600 hover:bg-orange-500 text-white"
                          : plan.popular
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                      }`}
                    >
                      {loading === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : plan.id === "free_user" &&
                        currentPlan &&
                        currentPlan !== "free_user" ? (
                        "Downgrade to Free"
                      ) : hasUsedTrial ? (
                        `Subscribe to ${plan.name}`
                      ) : (
                        `Start Free Trial`
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust badges - Mobile optimized */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-slate-500">
        <span className="text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" /> Secure via Stripe
        </span>
        <span className="text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" /> Cancel anytime
        </span>
      </div>
    </div>
  );
}
