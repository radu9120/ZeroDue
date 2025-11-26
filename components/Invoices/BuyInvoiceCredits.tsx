"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Receipt,
  Plus,
  Minus,
  CreditCard,
  Sparkles,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { AppPlan } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe promise at module level - this ensures it's created once
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BuyInvoiceCreditsProps {
  businessId: number;
  plan: AppPlan;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRICES = {
  free_user: 0.99,
  professional: 0.49,
  enterprise: 0,
};

// Payment Form Component
function PaymentForm({
  quantity,
  total,
  onSuccess,
  onBack,
}: {
  quantity: number;
  total: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Payment system not ready. Please wait...");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment failed");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.href,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        toast.success(
          `Successfully purchased ${quantity} invoice credit${quantity > 1 ? "s" : ""}!`
        );
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to quantity
      </button>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {quantity} invoice credit{quantity > 1 ? "s" : ""}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ${total}
          </span>
        </div>
      </div>

      <div className="min-h-[200px] relative">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-slate-500">
              Loading payment form...
            </span>
          </div>
        )}
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !ready || loading}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pay ${total}
          </span>
        )}
      </Button>
    </form>
  );
}

export function BuyInvoiceCredits({
  businessId,
  plan,
  onSuccess,
  onCancel,
}: BuyInvoiceCreditsProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pricePerInvoice = PRICES[plan] || 0.99;
  const total = (pricePerInvoice * quantity).toFixed(2);

  // Check dark mode
  useEffect(() => {
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

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      // Use embedded payment form instead of redirect
      const response = await fetch("/api/stripe/buy-invoice-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          quantity,
        }),
      });

      const data = await response.json();
      console.log("[BuyInvoiceCredits] API response:", data);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Validate client secret format before setting it
      if (
        data.clientSecret &&
        typeof data.clientSecret === "string" &&
        data.clientSecret.startsWith("pi_")
      ) {
        console.log(
          "[BuyInvoiceCredits] Valid client secret received, showing payment form"
        );
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      } else {
        console.error(
          "[BuyInvoiceCredits] Invalid client secret:",
          data.clientSecret
        );
        toast.error("Failed to initialize payment - invalid response");
      }
    } catch (error) {
      console.error("[BuyInvoiceCredits] Error:", error);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Add credits to business via API
    try {
      const response = await fetch("/api/stripe/add-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          quantity,
        }),
      });

      if (!response.ok) {
        console.error("Failed to add credits");
      }
    } catch (error) {
      console.error("Error adding credits:", error);
    }

    onSuccess?.();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md mx-auto shadow-xl">
      {!showPayment ? (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Get More Invoice Credits
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {plan === "free_user"
                ? "You've used your 2 free invoices. Buy more to continue."
                : "You've reached your monthly limit. Buy additional credits."}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Invoice Credits
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                ${pricePerInvoice.toFixed(2)} each
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {quantity}
                </span>
              </div>

              <button
                onClick={() => setQuantity(Math.min(50, quantity + 1))}
                disabled={quantity >= 50}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick select buttons */}
            <div className="flex gap-2 mt-4 justify-center">
              {[5, 10, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuantity(num)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    quantity === num
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${total}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              One-time payment • Credits never expire
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="neutralOutline"
                className="flex-1"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              onClick={handleProceedToPayment}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Continue to Payment
                </span>
              )}
            </Button>
          </div>

          {/* Upgrade suggestion */}
          {plan === "free_user" && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Save with Professional Plan
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Get 15 invoices/month + $0.49/extra invoice for just
                    $5.83/month
                  </p>
                  <a
                    href="/pricing"
                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block"
                  >
                    View plans →
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Complete Payment
            </h3>
          </div>

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: isDarkMode ? "night" : "stripe",
                  variables: {
                    colorPrimary: "#2563eb",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <PaymentForm
                quantity={quantity}
                total={total}
                onSuccess={handlePaymentSuccess}
                onBack={() => {
                  setShowPayment(false);
                  setClientSecret(null);
                }}
              />
            </Elements>
          )}
        </>
      )}
    </div>
  );
}
