"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { SignupModal } from "@/components/auth/SignupModal";
import currencies from "@/lib/currencies.json";
import { InvoicePreview } from "@/components/Invoices/InvoicePreview";
import Link from "next/link";

const guestInvoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number required"),
  company_name: z.string().min(2, "Company name required"),
  company_email: z.string().email("Valid email required"),
  company_address: z.string().min(1, "Address required"),
  company_phone: z.string().optional(),
  client_name: z.string().min(2, "Client name required"),
  client_email: z.string().email("Valid email required"),
  client_address: z.string().optional(),
  client_phone: z.string().optional(),
  issue_date: z.date(),
  due_date: z.date(),
  currency: z.string().default("GBP"),
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

type GuestInvoiceForm = z.infer<typeof guestInvoiceSchema>;

export default function TryPage() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<GuestInvoiceForm>({
    resolver: zodResolver(guestInvoiceSchema),
    defaultValues: {
      invoice_number: "INV-0001",
      company_name: "",
      company_email: "",
      company_address: "",
      company_phone: "",
      client_name: "",
      client_email: "",
      client_address: "",
      client_phone: "",
      issue_date: new Date(),
      due_date: addDays(new Date(), 14),
      currency: "GBP",
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
  const watchedCurrency = useWatch({ control: form.control, name: "currency" });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });
  const watchedShipping = useWatch({ control: form.control, name: "shipping" });
  const currencySymbol = getCurrencySymbol(watchedCurrency || "GBP");

  // Calculate totals
  useEffect(() => {
    // Calculate subtotal with tax per item
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

    // Apply discount (percentage)
    const discountAmount = subtotal * ((watchedDiscount || 0) / 100);
    // Add shipping
    const shipping = watchedShipping || 0;
    // Calculate total
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

  const onSubmit = (data: GuestInvoiceForm) => {
    localStorage.setItem("zerodue_pending_invoice", JSON.stringify(data));
    setShowSignupModal(true);
  };

  const formValues = form.watch();

  // Build preview data matching InvoicePreview formData structure
  const previewFormData = useMemo(
    () => ({
      invoice_number: formValues.invoice_number,
      company_details: {
        name: formValues.company_name,
        email: formValues.company_email,
        address: formValues.company_address,
        phone: formValues.company_phone || "",
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
      currency: formValues.currency,
    }),
    [formValues]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-32">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Create Your Invoice
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Fill in the details below. Sign up when you&apos;re ready to send.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Your Details */}
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Your Details
                  </h2>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Inc."
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
                    name="company_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="hello@acme.com"
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
                    name="company_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Main St, London"
                            {...field}
                            className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_phone"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_phone"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Pick date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarPicker
                            date={field.value}
                            onSelect={field.onChange}
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
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="neutralOutline"
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white dark:bg-transparent border-slate-300 dark:border-slate-400",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Pick date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarPicker
                            date={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

              {/* Totals Section - just show summary inline */}
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

            {/* Additional Details & Summary - matching dashboard layout */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left side - Bank Details & Notes */}
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
                            className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none min-h-32"
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
                            placeholder="Add any additional notes, payment terms, or conditions..."
                            {...field}
                            className="bg-white dark:bg-transparent border-slate-300 dark:border-slate-400 resize-none min-h-28"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right side - Invoice Summary */}
                <div className="w-full lg:w-80 lg:flex-shrink-0">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                      Invoice Summary
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
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                              Total Amount
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">
                              {currencySymbol}
                              {formValues.total?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="button"
                variant="neutralOutline"
                size="lg"
                onClick={() => setShowPreview(true)}
                className="h-14 px-8"
              >
                <Eye className="w-5 h-5 mr-2" /> Preview Invoice
              </Button>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue & Sign Up <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
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
