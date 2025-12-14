"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBusiness } from "@/lib/actions/business.actions";
import {
  Loader2,
  CheckCircle,
  Building2,
  FileText,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface GuestData {
  profile_type: "company" | "freelancer" | "exploring";
  business_name: string;
  business_email: string;
  business_address: string;
  business_phone?: string;
  business_currency: string;
  business_vat?: string;
  // Invoice fields
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  client_phone?: string;
  issue_date: string;
  due_date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax?: number;
    amount: number;
  }>;
  notes?: string;
  bank_details?: string;
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromGuest = searchParams.get("from_guest") === "true";

  const [step, setStep] = useState<
    "loading" | "creating-business" | "done" | "error" | "no-data"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);

  useEffect(() => {
    if (!fromGuest) {
      // Not from guest flow, redirect to dashboard
      router.replace("/dashboard");
      return;
    }

    const processGuestData = async () => {
      // Get guest data from localStorage
      const storedData = localStorage.getItem("zerodue_pending_guest_data");

      if (!storedData) {
        setStep("no-data");
        // No guest data, just go to create business manually
        setTimeout(() => router.replace("/dashboard/business/new"), 2000);
        return;
      }

      try {
        const guestData: GuestData = JSON.parse(storedData);

        // Step 1: Create business
        setStep("creating-business");

        const businessResult = await createBusiness({
          name: guestData.business_name,
          email: guestData.business_email,
          address: guestData.business_address,
          phone: guestData.business_phone || "",
          currency: guestData.business_currency,
          vat: guestData.business_vat || "",
          profile_type: guestData.profile_type,
        });

        if (!businessResult.ok) {
          throw new Error(businessResult.error);
        }

        const newBusinessId = businessResult.business.id;
        setBusinessId(newBusinessId);

        // Store invoice data separately for the invoice creation page
        localStorage.setItem(
          "zerodue_pending_invoice",
          JSON.stringify({
            invoice_number: guestData.invoice_number,
            client_name: guestData.client_name,
            client_email: guestData.client_email,
            client_address: guestData.client_address,
            issue_date: guestData.issue_date,
            due_date: guestData.due_date,
            items: guestData.items,
            notes: guestData.notes,
            bank_details: guestData.bank_details,
            subtotal: guestData.subtotal,
            discount: guestData.discount,
            shipping: guestData.shipping,
            total: guestData.total,
          })
        );

        // Clear the guest data
        localStorage.removeItem("zerodue_pending_guest_data");

        setStep("done");

        // Redirect to invoice creation with the new business
        setTimeout(() => {
          router.replace(
            `/dashboard/invoices/new?business_id=${newBusinessId}&from_guest=true`
          );
        }, 1500);
      } catch (err: any) {
        console.error("Onboarding error:", err);
        setError(err.message || "Something went wrong");
        setStep("error");
      }
    };

    processGuestData();
  }, [fromGuest, router]);

  const steps = [
    {
      id: "creating-business",
      label: "Creating your business",
      icon: Building2,
    },
    { id: "done", label: "Ready to create invoice", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center"
        >
          {step === "loading" && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Setting up your account...
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we prepare everything
              </p>
            </>
          )}

          {step === "creating-business" && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Creating your business...
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Setting up your profile and business details
              </p>
            </>
          )}

          {step === "done" && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                All set! 🎉
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Redirecting you to create your invoice...
              </p>
            </>
          )}

          {step === "no-data" && (
            <>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Let&apos;s set up your business first...
              </p>
            </>
          )}

          {step === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <button
                onClick={() => router.replace("/dashboard/business/new")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Set up manually
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
