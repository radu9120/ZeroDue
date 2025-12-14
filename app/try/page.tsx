"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { cn, getCurrencySymbol } from "@/lib/utils";
import {
  Building2,
  User,
  CalendarIcon,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Eye,
  Briefcase,
  Compass,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignupModal } from "@/components/auth/SignupModal";
import currencies from "@/lib/currencies.json";
import { InvoicePreview } from "@/components/Invoices/InvoicePreview";
import Link from "next/link";

// Profile types
type ProfileType = "company" | "freelancer" | "exploring";

// Step 1: Profile type selection
const profileTypes = [
  {
    id: "company" as ProfileType,
    title: "Company",
    description: "I run a registered business",
    icon: Building2,
  },
  {
    id: "freelancer" as ProfileType,
    title: "Freelancer",
    description: "I work independently",
    icon: Briefcase,
  },
  {
    id: "exploring" as ProfileType,
    title: "Just Exploring",
    description: "I want to see how it works",
    icon: Compass,
  },
];

// Schema for the complete guest data
const guestDataSchema = z.object({
  // Business info
  profile_type: z.enum(["company", "freelancer", "exploring"]),
  business_name: z.string().min(2, "Business name required"),
  business_email: z.string().email("Valid email required"),
  business_address: z.string().min(1, "Address required"),
  business_phone: z.string().optional(),
  business_currency: z.string().default("GBP"),
  business_vat: z.string().optional(),
  // Invoice info
  invoice_number: z.string().min(1, "Invoice number required"),
  client_name: z.string().min(2, "Client name required"),
  client_email: z.string().email("Valid email required"),
  client_address: z.string().optional(),
  client_phone: z.string().optional(),
  issue_date: z.date(),
  due_date: z.date(),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description required"),
      quantity: z.coerce.number().min(0),
      unit_price: z.coerce.number().min(0),
      tax: z.coerce.number().min(0).max(100).optional(),
      amount: z.coerce.number(),
    })
  ),
  notes: z.string().optional(),
  bank_details: z.string().optional(),
  subtotal: z.number(),
  discount: z.coerce.number().min(0).max(100).optional(),
  shipping: z.coerce.number().min(0).optional(),
  total: z.number(),
});

type GuestData = z.infer<typeof guestDataSchema>;

export default function TryPage() {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<GuestData>({
    resolver: zodResolver(guestDataSchema),
    defaultValues: {
      profile_type: "company",
      business_name: "",
      business_email: "",
      business_address: "",
      business_phone: "",
      business_currency: "GBP",
      business_vat: "",
      invoice_number: "INV-0001",
      client_name: "",
      client_email: "",
      client_address: "",
      client_phone: "",
      issue_date: new Date(),
      due_date: addDays(new Date(), 14),
      items: [
        { description: "", quantity: 1, unit_price: 0, tax: 0, amount: 0 },
      ],
      notes: "",
      bank_details: "",
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    },
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedCurrency = useWatch({
    control: form.control,
    name: "business_currency",
  });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });
  const watchedShipping = useWatch({ control: form.control, name: "shipping" });
  const currencySymbol = getCurrencySymbol(watchedCurrency || "GBP");

  // Calculate totals
  useEffect(() => {
    let subtotal = 0;
    let totalTax = 0;
    watchedItems.forEach((item, index) => {
      const baseAmount = (item.quantity || 0) * (item.unit_price || 0);
      const itemTax = baseAmount * ((item.tax || 0) / 100);
      const amount = baseAmount + itemTax;
      totalTax += itemTax;
      subtotal += baseAmount;
      if (item.amount !== amount) {
        form.setValue(`items.${index}.amount`, amount);
      }
    });

    const discountAmount = subtotal * ((watchedDiscount || 0) / 100);
    const shipping = watchedShipping || 0;
    const total = subtotal + totalTax - discountAmount + shipping;

    form.setValue("subtotal", subtotal);
    form.setValue("total", total);
  }, [watchedItems, watchedDiscount, watchedShipping, form]);

  const addItem = () => {
    const items = form.getValues("items");
    form.setValue("items", [
      ...items,
      { description: "", quantity: 1, unit_price: 0, tax: 0, amount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const items = form.getValues("items");
    if (items.length > 1) {
      form.setValue(
        "items",
        items.filter((_, i) => i !== index)
      );
    }
  };

  const handleProfileSelect = (type: ProfileType) => {
    setProfileType(type);
    form.setValue("profile_type", type);
    setStep(2);
  };

  const handleStep2Next = async () => {
    // Validate business fields
    const isValid = await form.trigger([
      "business_name",
      "business_email",
      "business_address",
    ]);
    if (isValid) {
      setStep(3);
    }
  };

  const onSubmit = (data: GuestData) => {
    // Store all data for after signup
    localStorage.setItem("zerodue_pending_guest_data", JSON.stringify(data));
    setShowSignupModal(true);
  };

  const formValues = form.watch();

  // Build preview data
  const previewFormData = useMemo(
    () => ({
      invoice_number: formValues.invoice_number,
      company_details: {
        name: formValues.business_name,
        email: formValues.business_email,
        address: formValues.business_address,
        phone: formValues.business_phone || "",
        logo: "",
      },
      bill_to: {
        name: formValues.client_name,
        email: formValues.client_email,
        address: formValues.client_address || "",
      },
      issue_date: formValues.issue_date,
      due_date: formValues.due_date,
      items: formValues.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax: item.tax,
        amount: item.amount,
      })),
      subtotal: formValues.subtotal,
      discount: formValues.discount,
      shipping: formValues.shipping,
      total: formValues.total,
      notes: formValues.notes || "",
      bank_details: formValues.bank_details || "",
      currency: formValues.business_currency,
    }),
    [formValues]
  );

  // Step indicator
  const steps = [
    { num: 1, label: "Profile" },
    { num: 2, label: "Business" },
    { num: 3, label: "Invoice" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                  step >= s.num
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                )}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium hidden sm:block",
                  step >= s.num
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 h-1 mx-3 rounded-full transition-all",
                    step > s.num
                      ? "bg-blue-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Profile Type Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  Welcome! Let&apos;s get started
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  First, tell us a bit about yourself
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {profileTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleProfileSelect(type.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]",
                      "bg-white dark:bg-slate-800/50 hover:border-blue-500",
                      profileType === type.id
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                      <type.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {type.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* STEP 2: Business Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  Your {profileType === "freelancer" ? "Freelance" : "Business"}{" "}
                  Details
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  This information will appear on your invoices
                </p>
              </div>

              <Form {...form}>
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {profileType === "freelancer"
                              ? "Your Name / Business Name"
                              : "Company Name"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                profileType === "freelancer"
                                  ? "John Doe"
                                  : "Acme Inc."
                              }
                              {...field}
                              className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="business_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="hello@example.com"
                              {...field}
                              className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="business_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Main St, London, UK"
                            {...field}
                            className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="business_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+44 7700 900000"
                              {...field}
                              className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="business_currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.code} ({c.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    {profileType === "company" && (
                      <FormField
                        control={form.control}
                        name="business_vat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="GB123456789"
                                {...field}
                                className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-4 justify-between">
                  <Button
                    type="button"
                    variant="neutralOutline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleStep2Next}
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Form>
            </motion.div>
          )}

          {/* STEP 3: Create Invoice */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  Create Your First Invoice
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Almost done! Fill in the invoice details
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Client Details & Invoice Info */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Client Details */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Client Details
                        </h2>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="client_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  {...field}
                                  className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="client_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="john@example.com"
                                  {...field}
                                  className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="client_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="456 Oak Ave, Manchester"
                                  {...field}
                                  className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none"
                                  rows={2}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Invoice Details
                        </h2>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="invoice_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Invoice Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="issue_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Issue Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="neutralOutline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal bg-white dark:bg-transparent border-slate-300 dark:border-slate-400",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? format(field.value, "dd/MM/yyyy")
                                          : "Pick date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <CalendarPicker
                                      date={field.value}
                                      onSelect={field.onChange}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="neutralOutline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal bg-white dark:bg-transparent border-slate-300 dark:border-slate-400",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? format(field.value, "dd/MM/yyyy")
                                          : "Pick date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <CalendarPicker
                                      date={field.value}
                                      onSelect={field.onChange}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Line Items
                      </h2>
                      <Button
                        type="button"
                        variant="neutralOutline"
                        size="sm"
                        onClick={addItem}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                      </Button>
                    </div>

                    {/* Header */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-4 pb-3 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-1 text-right">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-right">Tax %</div>
                      <div className="col-span-2 text-right">Amount</div>
                    </div>

                    {/* Items */}
                    <div className="space-y-4 mt-4">
                      {watchedItems.map((item, index) => (
                        <div
                          key={index}
                          className="grid sm:grid-cols-12 gap-4 items-start"
                        >
                          <div className="sm:col-span-5">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Service description"
                                      {...field}
                                      className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      {...field}
                                      className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 text-right"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...field}
                                      className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 text-right"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.tax`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      placeholder="0"
                                      {...field}
                                      className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 text-right"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-2">
                            <div className="flex-1 text-right font-medium text-slate-900 dark:text-white py-2">
                              {currencySymbol}
                              {item.amount?.toFixed(2) || "0.00"}
                            </div>
                            {watchedItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Subtotal</span>
                          <span>
                            {currencySymbol}
                            {formValues.subtotal?.toFixed(2)}
                          </span>
                        </div>
                        {(formValues.discount ?? 0) > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Discount ({formValues.discount}%)</span>
                            <span className="text-red-500">
                              -{currencySymbol}
                              {(
                                (formValues.subtotal ?? 0) *
                                ((formValues.discount ?? 0) / 100)
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {(formValues.shipping ?? 0) > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Shipping</span>
                            <span>
                              {currencySymbol}
                              {(formValues.shipping ?? 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span>Total</span>
                          <span>
                            {currencySymbol}
                            {formValues.total?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details & Notes + Summary */}
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <FormField
                          control={form.control}
                          name="bank_details"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your bank details or payment instructions..."
                                  {...field}
                                  className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none min-h-24"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes & Terms</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any additional notes..."
                                  {...field}
                                  className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none min-h-20"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-full lg:w-72 lg:flex-shrink-0">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Adjustments
                          </h4>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="shipping"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shipping</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="discount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discount (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      placeholder="0"
                                      {...field}
                                      className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <Button
                      type="button"
                      variant="neutralOutline"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="neutralOutline"
                        size="lg"
                        onClick={() => setShowPreview(true)}
                        className="h-12 px-6"
                      >
                        <Eye className="w-5 h-5 mr-2" /> Preview
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Continue & Sign Up{" "}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <InvoicePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={previewFormData}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        invoiceData={formValues}
      />
    </div>
  );
}
