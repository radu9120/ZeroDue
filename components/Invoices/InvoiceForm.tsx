"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, useWatch } from "react-hook-form";
import InvoiceItems from "./InvoiceItems";
import { Textarea } from "../ui/textarea";
import { createInvoice } from "@/lib/actions/invoice.actions";
import { formSchema } from "@/schemas/invoiceSchema";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { BusinessType, ClientType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import Link from "next/link";
import CustomButton from "../ui/CustomButton";
import {
  Building2,
  User,
  Calendar,
  FileText,
  CalendarIcon,
  Truck,
  Hammer,
  Code,
} from "lucide-react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn, normalizeCurrencyCode } from "@/lib/utils";
import { toast } from "sonner";
import CustomModal from "../ModalsForms/CustomModal";
import { ClientForm } from "../Clients/ClientForm";
import {
  InvoiceTemplateSelector,
  InvoiceTemplateType,
} from "./InvoiceTemplateSelector";
import { CalendarPicker } from "../ui/calendar-picker";
import { InvoicePreview } from "./InvoicePreview";
import { BuyInvoiceCredits } from "./BuyInvoiceCredits";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Custom Calendar Component
// Removed local definition

const InvoiceForm = ({
  company_data,
  client_data,
  clients,
}: {
  company_data: BusinessType;
  client_data?: ClientType;
  clients?: ClientType[];
}) => {
  const router = useRouter();
  const defaultCurrency = useMemo(
    () => normalizeCurrencyCode(company_data.currency),
    [company_data.currency]
  );
  const defaultCompanyDetails = useMemo(
    () => ({
      name: company_data.name,
      email: company_data.email,
      address: company_data.address,
      phone: company_data.phone ?? "",
      vat: company_data.vat ?? undefined,
      tax_label: company_data.tax_label ?? "VAT",
      logo: company_data.logo ?? "",
      currency: defaultCurrency,
      profile_type: company_data.profile_type ?? "company",
    }),
    [company_data, defaultCurrency]
  );

  const [selectedTemplate, setSelectedTemplate] =
    useState<InvoiceTemplateType>("standard");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<
    "free_user" | "professional" | "enterprise"
  >("free_user");

  // Fetch current plan on mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/plan");
        const data = await res.json();
        setCurrentPlan(data.plan || "free_user");
      } catch {
        setCurrentPlan("free_user");
      }
    };
    fetchPlan();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      invoice_number: "INV0001",
      company_details: defaultCompanyDetails,
      bill_to: client_data,
      issue_date: new Date(),
      due_date: new Date(),
      items: [
        {
          description: "",
          unit_price: 0,
          quantity: 0,
          tax: 0,
          amount: 0,
        },
      ],
      description: "",
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      notes: "",
      bank_details: "",
      currency: defaultCurrency,
      client_id: client_data?.id || undefined,
      business_id: company_data.id,
      invoice_template: "standard",
      meta_data: {},
    },
  });

  // Autosave key based on business ID
  const autosaveKey = `invoice_draft_${company_data.id}`;

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(autosaveKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // Only restore if it's for the same business and recent (within 24 hours)
        const savedAt = parsed._savedAt;
        const isRecent = savedAt && Date.now() - savedAt < 24 * 60 * 60 * 1000;

        if (isRecent && parsed.business_id === company_data.id) {
          // Restore form values (except dates which need special handling)
          const { _savedAt, issue_date, due_date, ...restData } = parsed;

          // Reset form with saved data
          if (restData.items?.length > 0) {
            form.reset({
              ...form.getValues(),
              ...restData,
              issue_date: issue_date ? new Date(issue_date) : new Date(),
              due_date: due_date ? new Date(due_date) : new Date(),
            });
            toast.info("Draft restored from previous session", {
              description: "Your unsaved invoice has been recovered.",
              duration: 4000,
            });
          }
        }
      }
    } catch (e) {
      // Silently fail if localStorage isn't available
      console.warn("Could not restore draft:", e);
    }
  }, [autosaveKey, company_data.id]);

  // Autosave to localStorage on form changes (debounced)
  const formValues = form.watch();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const dataToSave = {
          ...formValues,
          _savedAt: Date.now(),
        };
        localStorage.setItem(autosaveKey, JSON.stringify(dataToSave));
      } catch (e) {
        // Silently fail if localStorage isn't available
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formValues, autosaveKey]);

  // Clear draft when form is successfully submitted
  const clearDraft = () => {
    try {
      localStorage.removeItem(autosaveKey);
    } catch (e) {
      // Silently fail
    }
  };

  // Update form when template changes
  useEffect(() => {
    form.setValue("invoice_template", selectedTemplate);

    // Pre-populate items based on template
    const currentItems = form.getValues("items");

    // Helper to check if items match a specific template's defaults
    const isTemplateDefaults = (items: any[], descriptions: string[]) => {
      if (items.length !== descriptions.length) return false;
      return items.every(
        (item, i) => item.description === descriptions[i] && item.amount === 0
      );
    };

    const isStandardDefault =
      currentItems.length === 1 &&
      currentItems[0].description === "" &&
      currentItems[0].amount === 0;
    const isTruckingDefault = isTemplateDefaults(currentItems, [
      "Freight Charge",
      "Fuel Surcharge",
    ]);
    const isConstructionDefault = isTemplateDefaults(currentItems, [
      "Labor",
      "Materials",
    ]);
    const isFreelanceDefault = isTemplateDefaults(currentItems, [
      "Development Services",
    ]);
    const isHourlyDefault = isTemplateDefaults(currentItems, [
      "Consulting Hours",
    ]);

    // If the current items are just defaults from ANY template (including standard empty),
    // then we can safely switch them to the new template's defaults.
    if (
      isStandardDefault ||
      isTruckingDefault ||
      isConstructionDefault ||
      isFreelanceDefault ||
      isHourlyDefault
    ) {
      if (selectedTemplate === "trucking") {
        form.setValue("items", [
          {
            description: "Freight Charge",
            unit_price: 0,
            quantity: 1,
            tax: 0,
            amount: 0,
          },
          {
            description: "Fuel Surcharge",
            unit_price: 0,
            quantity: 1,
            tax: 0,
            amount: 0,
          },
        ]);
      } else if (selectedTemplate === "construction") {
        form.setValue("items", [
          {
            description: "Labor",
            unit_price: 0,
            quantity: 1,
            tax: 0,
            amount: 0,
          },
          {
            description: "Materials",
            unit_price: 0,
            quantity: 1,
            tax: 0,
            amount: 0,
          },
        ]);
      } else if (selectedTemplate === "freelance") {
        form.setValue("items", [
          {
            description: "Development Services",
            unit_price: 0,
            quantity: 1,
            tax: 0,
            amount: 0,
          },
        ]);
      } else if (selectedTemplate === "hourly") {
        form.setValue("items", [
          {
            description: "Consulting Hours",
            unit_price: 0,
            quantity: 1,
            tax: 0,
            amount: 0,
          },
        ]);
      } else {
        // Reset to standard empty if switching back to standard
        form.setValue("items", [
          {
            description: "",
            unit_price: 0,
            quantity: 0,
            tax: 0,
            amount: 0,
          },
        ]);
      }
    }
  }, [selectedTemplate, form]);

  const hasCustomInvoiceNumber = useRef(false);

  useEffect(() => {
    form.setValue("company_details", defaultCompanyDetails, {
      shouldDirty: false,
    });
    form.setValue("currency", defaultCurrency, {
      shouldDirty: false,
    });
  }, [defaultCompanyDetails, defaultCurrency, form]);

  useEffect(() => {
    if (!company_data.id) return;
    let cancelled = false;
    hasCustomInvoiceNumber.current = false;

    const fetchNextInvoiceNumber = async () => {
      try {
        const response = await fetch(
          `/api/invoices/next-number?business_id=${company_data.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch next invoice number");
        }
        const payload = (await response.json()) as {
          invoice_number?: string;
        };

        if (
          !cancelled &&
          payload?.invoice_number &&
          !hasCustomInvoiceNumber.current
        ) {
          form.setValue("invoice_number", payload.invoice_number, {
            shouldDirty: false,
          });
        }
      } catch (error) {
        console.error("Unable to fetch invoice number", error);
      }
    };

    void fetchNextInvoiceNumber();

    return () => {
      cancelled = true;
    };
  }, [company_data.id, form]);

  const items = useWatch({ control: form.control, name: "items" });
  const discount =
    Number(useWatch({ control: form.control, name: "discount" })) || 0;
  const shipping =
    Number(useWatch({ control: form.control, name: "shipping" })) || 0;
  const total = Number(useWatch({ control: form.control, name: "total" })) || 0;
  const bill_to = useWatch({ control: form.control, name: "bill_to" });

  // Automatically calculate totals
  useEffect(() => {
    const subtotal =
      items?.reduce((sum, item) => {
        const quantity = item.amount || 0;
        return sum + quantity;
      }, 0) || 0;

    const clampedDiscount = Math.min(Math.max(discount, 0), 100);
    if (clampedDiscount !== discount) {
      form.setValue("discount", clampedDiscount, { shouldDirty: true });
    }

    const sanitizedShipping = shipping < 0 ? 0 : shipping;
    if (sanitizedShipping !== shipping) {
      form.setValue("shipping", sanitizedShipping, { shouldDirty: true });
    }

    const discountAmount = subtotal * (clampedDiscount / 100);
    const calculatedTotal = Math.max(
      subtotal - discountAmount + sanitizedShipping,
      0
    );

    form.setValue("subtotal", subtotal);
    form.setValue("total", calculatedTotal);
  }, [form, items, discount, shipping]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Add status field before sending to backend
      const invoiceData = {
        ...values,
        status: "draft" as const,
        currency: normalizeCurrencyCode(values.currency),
        invoice_template: selectedTemplate,
        meta_data: values.meta_data || {},
      };

      const result = await createInvoice(invoiceData as any);

      // Check if result is an error object
      if (result && "error" in result) {
        const errorMessage = result.error;
        if (errorMessage.includes("NEEDS_PAYMENT")) {
          setShowBuyCreditsModal(true);
          return;
        }
        toast.error(errorMessage);
        return;
      }

      const invoice = result;
      if (invoice && invoice.id) {
        clearDraft(); // Clear the autosaved draft on successful creation
        const redirectUrl = `/dashboard/invoices/success?invoice_id=${invoice.id}&business_id=${company_data.id}`;
        // Use router.push instead of redirect to avoid the NEXT_REDIRECT error being caught
        window.location.href = redirectUrl;
      } else {
        toast.error("Failed to create invoice. Please try again.");
      }
    } catch (error: unknown) {
      // Check if it's a Next.js redirect (not an actual error)
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error; // Re-throw redirect errors
      }

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      // Check if it's a payment required error
      if (errorMessage.includes("NEEDS_PAYMENT")) {
        // Show the buy credits modal
        setShowBuyCreditsModal(true);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Show validation errors as toast only after user attempts to submit
  useEffect(() => {
    // Only show errors if user has attempted to submit the form
    if (!form.formState.isSubmitted) return;

    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error(String(firstError.message));
      }
    }
  }, [form.formState.errors, form.formState.isSubmitted]);

  return (
    <>
      {/* Buy Credits Modal */}
      <AnimatePresence>
        {showBuyCreditsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBuyCreditsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              <button
                onClick={() => setShowBuyCreditsModal(false)}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
              <BuyInvoiceCredits
                businessId={company_data.id}
                plan={currentPlan}
                onSuccess={() => {
                  setShowBuyCreditsModal(false);
                  // Refresh the page to update credits
                  window.location.reload();
                }}
                onCancel={() => setShowBuyCreditsModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-800">
        <div className="p-4 sm:p-6 md:p-8 pb-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Select Invoice Type
          </h2>
          <InvoiceTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </div>

        {/* @ts-ignore - Form control type mismatch with resolver, functionally correct */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-12 text-gray-900 dark:text-slate-100"
          >
            {/* Template Specific Fields */}
            {selectedTemplate === "trucking" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Logistics Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta_data.origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City, State"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_data.destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City, State"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_data.bol_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill of Lading #</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="BOL-12345"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_data.truck_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Truck / Trailer #</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Truck 101"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {selectedTemplate === "construction" && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800 space-y-4">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <Hammer className="h-5 w-5" />
                  Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta_data.project_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Downtown Office Reno"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_data.site_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Construction Way"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {selectedTemplate === "freelance" && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 space-y-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta_data.project_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Website Redesign"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_data.po_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Company & Client Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* From - Company Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      From
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Your business information
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-100/50 dark:border-blue-800/50">
                  {/* Company Logo Display */}
                  {company_data.logo && (
                    <div className="mb-6 flex justify-start">
                      <div className="w-32 h-24 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-gray-100">
                        <Image
                          src={company_data.logo}
                          alt="Company Logo"
                          width={196}
                          height={196}
                          className="w-full h-full object-contain object-left"
                        />
                      </div>
                    </div>
                  )}

                  {/* Company Details */}
                  <div className="space-y-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Company Name
                      </span>
                      <p className="text-gray-900 dark:text-slate-100 font-semibold text-lg">
                        {company_data.name}
                      </p>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Email
                      </span>
                      <p className="text-gray-700 dark:text-slate-300">
                        {company_data.email}
                      </p>
                    </div>
                    {company_data.phone && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                          Phone
                        </span>
                        <p className="text-gray-700 dark:text-slate-300">
                          {company_data.phone}
                        </p>
                      </div>
                    )}
                    {company_data.address && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                          Address
                        </span>
                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                          {company_data.address}
                        </p>
                      </div>
                    )}
                    {company_data.vat && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                          VAT Number
                        </span>
                        <p className="text-gray-700 dark:text-slate-300 font-mono">
                          {company_data.vat}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* To - Client Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      Bill To
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Client information
                    </p>
                  </div>
                </div>

                {client_data ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 border border-green-100/50 dark:border-green-800/50">
                    <div className="space-y-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                          Client Name
                        </span>
                        <p className="text-gray-900 dark:text-slate-100 font-semibold text-lg">
                          {client_data.name}
                        </p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                          Email
                        </span>
                        <p className="text-gray-700 dark:text-slate-300">
                          {client_data.email}
                        </p>
                      </div>
                      {client_data.phone && (
                        <div>
                          <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                            Phone
                          </span>
                          <p className="text-gray-700 dark:text-slate-300">
                            {client_data.phone}
                          </p>
                        </div>
                      )}
                      {client_data.address && (
                        <div>
                          <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                            Address
                          </span>
                          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                            {client_data.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : clients && clients.length > 0 ? (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Select Client
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                const selectedClient = clients.find(
                                  (client) => client.id === Number(value)
                                );
                                if (selectedClient) {
                                  form.setValue("client_id", selectedClient.id);
                                  form.setValue("bill_to", {
                                    name: selectedClient.name,
                                    email: selectedClient.email,
                                    address: selectedClient.address,
                                    phone: selectedClient.phone,
                                    id: selectedClient.id,
                                    business_id: selectedClient.business_id,
                                  });
                                }
                                field.onChange(Number(value));
                              }}
                              defaultValue={
                                field.value ? String(field.value) : undefined
                              }
                            >
                              <SelectTrigger className="w-full h-12 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl">
                                <span className="text-gray-600 dark:text-slate-300">
                                  {field.value
                                    ? clients.find((c) => c.id === field.value)
                                        ?.name
                                    : "Select a client..."}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem
                                    key={client.id}
                                    value={String(client.id)}
                                  >
                                    <div className="flex flex-col py-1">
                                      <span className="font-medium">
                                        {client.name}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {client.email}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {bill_to && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 border border-green-100/50 dark:border-green-800/50">
                        <div className="space-y-4">
                          <div>
                            <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                              Client Name
                            </span>
                            <p className="text-gray-900 dark:text-slate-100 font-semibold text-lg">
                              {bill_to.name}
                            </p>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                              Email
                            </span>
                            <p className="text-gray-700 dark:text-slate-300">
                              {bill_to.email}
                            </p>
                          </div>
                          {bill_to.phone && (
                            <div>
                              <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                                Phone
                              </span>
                              <p className="text-gray-700 dark:text-slate-300">
                                {bill_to.phone}
                              </p>
                            </div>
                          )}
                          {bill_to.address && (
                            <div>
                              <span className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                                Address
                              </span>
                              <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                                {bill_to.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <User className="h-6 w-6 text-amber-600" />
                      </div>
                      <p className="text-amber-800 dark:text-amber-300 font-medium mb-3">
                        No clients found for this business
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 text-sm mb-4">
                        Create your first client to get started with invoicing
                      </p>
                      <CustomModal
                        heading="Create New Client"
                        description="Add a new client to your business"
                        customTrigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            Create New Client
                          </Button>
                        }
                      >
                        <ClientForm business_id={company_data.id} />
                      </CustomModal>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Invoice Details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Invoice number and dates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        Invoice Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="INV001"
                          {...field}
                          value={field.value || ""}
                          onChange={(event) => {
                            hasCustomInvoiceNumber.current = true;
                            field.onChange(event);
                          }}
                          className="h-12 font-mono border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issue_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Issue Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full h-12 justify-start text-left font-normal border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-3 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "MMM dd, yyyy")
                                  : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarPicker
                              date={field.value}
                              onSelect={(date) => field.onChange(date)}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Due Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full h-12 justify-start text-left font-normal border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-3 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "MMM dd, yyyy")
                                  : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarPicker
                              date={field.value}
                              onSelect={(date) => field.onChange(date)}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Invoice Items
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Add items, services, or products
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <InvoiceItems
                        taxLabel={company_data.tax_label || "VAT"}
                        template={selectedTemplate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Details & Summary */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-12">
              <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-12">
                <div className="flex-1 space-y-8">
                  <FormField
                    control={form.control}
                    name="bank_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Bank Details
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-32 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl"
                            placeholder="Enter your bank details or payment instructions..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Notes & Terms
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-28 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl"
                            placeholder="Add any additional notes, payment terms, or conditions..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-full lg:w-80 lg:flex-shrink-0">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">
                      Invoice Summary
                    </h4>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="shipping"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Shipping
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="h-11 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300">
                              Discount (%)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0"
                                className="h-11 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                              Total Amount
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                              £{total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-8">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => setIsPreviewOpen(true)}
                  className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Preview Invoice
                </Button>
                <CustomButton
                  type="submit"
                  label="Create Invoice"
                  variant="primary"
                />
              </div>
            </div>
          </form>
        </Form>

        {/* Invoice Preview Modal */}
        <InvoicePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          formData={form.watch()}
        />
      </div>
    </>
  );
};

export default InvoiceForm;
