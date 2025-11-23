"use client";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Textarea } from "../../ui/textarea";
import { Plus } from "lucide-react";
import { companySchema } from "@/schemas/invoiceSchema";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { AppPlan } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import currencies from "@/lib/currencies.json";
import taxTypes from "@/lib/tax-types.json";

type CurrencyOption = {
  code: string;
  name: string;
  symbol?: string;
};

type TaxTypeOption = {
  code: string;
  name: string;
  countries: string[];
};

interface BusinessFormProps {
  form: UseFormReturn<z.infer<typeof companySchema>, any>;
  onSubmit: (values: z.infer<typeof companySchema>) => Promise<void>;
  submitButtonText?: string;
  onFileChange: (file: File | null) => void;
  existingLogoUrl?: string | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  mode?: "company" | "freelancer" | "exploring";
}

export default function BusinessForm({
  form,
  onSubmit,
  submitButtonText = "Submit",
  onFileChange,
  existingLogoUrl,
  isSubmitting = false,
  onCancel,
  mode = "company",
}: BusinessFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<AppPlan>("free_user");

  const currencyOptions = useMemo(() => {
    return (currencies as CurrencyOption[]).map((currency) => {
      const hasSymbol =
        typeof currency.symbol === "string" &&
        currency.symbol.trim().length > 0;
      const label = hasSymbol
        ? `${currency.code} — ${currency.symbol} ${currency.name}`
        : `${currency.code} — ${currency.name}`;
      return {
        code: currency.code,
        label,
      };
    });
  }, []);

  const taxTypeOptions = useMemo(() => {
    return (taxTypes as TaxTypeOption[]).map((tax) => ({
      code: tax.code,
      label: `${tax.code} — ${tax.name}`,
      countries: tax.countries,
    }));
  }, []);

  // Fetch current plan dynamically so the modal shows accurate limits
  useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      try {
        const res = await fetch("/api/plan", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.plan) setUserPlan(data.plan as AppPlan);
      } catch (_) {
        // ignore errors; default remains free_user
      }
    }
    loadPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    form.register("profile_type");
  }, [form]);

  useEffect(() => {
    // More robust validation
    if (
      existingLogoUrl &&
      existingLogoUrl.trim() !== "" &&
      existingLogoUrl !== "null" &&
      existingLogoUrl !== "undefined" &&
      (existingLogoUrl.startsWith("http") ||
        existingLogoUrl.startsWith("/") ||
        existingLogoUrl.startsWith("blob:"))
    ) {
      setPreviewUrl(existingLogoUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [existingLogoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      onFileChange(file);
      setPreviewUrl(URL.createObjectURL(file));
      form.setValue("logo", "");
    } else {
      onFileChange(null);
      form.setValue("logo", "");
      // More robust validation here too
      if (
        existingLogoUrl &&
        existingLogoUrl.trim() !== "" &&
        existingLogoUrl !== "null" &&
        existingLogoUrl !== "undefined" &&
        (existingLogoUrl.startsWith("http") ||
          existingLogoUrl.startsWith("/") ||
          existingLogoUrl.startsWith("blob:"))
      ) {
        setPreviewUrl(existingLogoUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const profileType = form.watch("profile_type") ?? mode;
  const isPersonalProfile = profileType !== "company";
  useEffect(() => {
    if (isPersonalProfile) {
      form.setValue("tax_label", "Tax number");
    } else if (!form.getValues("tax_label")) {
      form.setValue("tax_label", "VAT");
    }
  }, [form, isPersonalProfile]);
  const fieldInputClass =
    "text-slate-900 dark:text-slate-100 dark:bg-slate-900/40 dark:border-slate-700";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-8">
        {form.formState.errors.root?.message && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {form.formState.errors.root.message}
          </div>
        )}
        {/* Company Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  {isPersonalProfile
                    ? "Your name or brand *"
                    : "Company name *"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      isPersonalProfile
                        ? "e.g. Jordan Smith Design"
                        : "e.g. Acme Ltd"
                    }
                    {...field}
                    disabled={isSubmitting}
                    className={fieldInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Email *
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                    disabled={isSubmitting}
                    className={fieldInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Phone
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...field}
                    disabled={isSubmitting}
                    className={fieldInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vat"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  {isPersonalProfile
                    ? "Tax number (NINO or UTR)"
                    : `${form.watch("tax_label") || "VAT"} Number`}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      isPersonalProfile
                        ? "e.g. QQ 12 34 56 C or UTR 1234567890"
                        : `Enter ${form.watch("tax_label") || "VAT"} number`
                    }
                    type="text"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                    className={fieldInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isPersonalProfile && (
            <FormField
              control={form.control}
              name="tax_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                    Tax ID Type
                  </FormLabel>
                  <Select
                    value={field.value || "VAT"}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64">
                      {taxTypeOptions.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-secondary-text dark:text-slate-300">
                    Choose the tax identification type for your region (e.g.,
                    VAT, GST, EIN).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  Default Currency *
                </FormLabel>
                <Select
                  value={field.value || "GBP"}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-64">
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-secondary-text dark:text-slate-300">
                  Sets the default currency for invoices created under this
                  business.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                Address *
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isPersonalProfile
                      ? "Enter the address you want shown on invoices"
                      : "Enter company registered address"
                  }
                  {...field}
                  disabled={isSubmitting}
                  rows={3}
                  className={fieldInputClass}
                />
              </FormControl>
              <FormDescription className="text-xs text-secondary-text dark:text-slate-400">
                Clients will see this address on each invoice.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Upload Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-secondary-text dark:text-slate-400">
                  {isPersonalProfile ? "Logo or avatar" : "Company logo"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormDescription className="text-xs text-secondary-text dark:text-slate-400">
                  {isPersonalProfile
                    ? "Optional: add a personal logo, portrait, or leave blank."
                    : "Upload a logo for your company (PNG, JPG, JPEG - Max 5MB)"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Logo Preview */}
          {previewUrl && (
            <div className="w-full">
              <p className="text-sm font-medium text-secondary-text dark:text-slate-400 mb-2">
                Logo Preview:
              </p>
              <div className="w-32 h-20 border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                <Image
                  src={previewUrl}
                  alt="Logo Preview"
                  className="max-w-full max-h-full object-contain"
                  width={128}
                  height={80}
                />
              </div>
            </div>
          )}
        </div>

        {/* Plan Information */}
        <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
          <h4 className="font-medium text-primary dark:text-blue-400 mb-2">
            {userPlan === "enterprise"
              ? "Enterprise Plan Includes:"
              : userPlan === "professional"
                ? "Professional Plan Includes:"
                : "Free Plan Includes:"}
          </h4>
          <ul className="text-sm text-secondary-text dark:text-slate-400 space-y-1">
            {userPlan === "enterprise" && (
              <>
                <li>• Unlimited business profiles</li>
                <li>• Unlimited invoices</li>
                <li>• Unlimited clients plus bulk import</li>
                <li>• Customizable invoice templates</li>
                <li>• Priority support</li>
                <li>• Advanced reporting</li>
              </>
            )}
            {userPlan === "professional" && (
              <>
                <li>• Up to 3 business profiles</li>
                <li>• Up to 15 invoices per month</li>
                <li>• Unlimited clients plus bulk import</li>
                <li>• Full dashboard analytics</li>
                <li>• Priority email support</li>
              </>
            )}
            {userPlan === "free_user" && (
              <>
                <li>
                  • 1 {mode === "company" ? "business profile" : "profile"}
                </li>
                <li>• Up to 3 invoices per month</li>
                <li>• Unlimited clients</li>
                <li>• Essential invoice template</li>
                <li>• Email support</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1 border-blue-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700"
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
            disabled={!form.formState.isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {submitButtonText}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
