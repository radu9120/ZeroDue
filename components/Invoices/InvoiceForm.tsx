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
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn, normalizeCurrencyCode } from "@/lib/utils";

// Custom Calendar Component
const CalendarPicker = ({
  date,
  onSelect,
}: {
  date?: Date;
  onSelect: (date: Date) => void;
}) => {
  const [viewDate, setViewDate] = useState(date || new Date());

  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create calendar grid
  const calendarDays = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: dayDate.toDateString() === today.toDateString(),
      isSelected: date && dayDate.toDateString() === date.toDateString(),
      date: dayDate,
    });
  }

  // Next month days to fill grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month + 1, day),
    });
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 text-blue-600 dark:text-blue-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-lg font-semibold text-gray-800 dark:text-slate-100">
          {months[month]} {year}
        </div>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 text-blue-600 dark:text-blue-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center text-sm font-semibold text-gray-500 dark:text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((calDay, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(calDay.date)}
            className={cn(
              "h-10 w-10 text-sm rounded-lg font-medium transition-all duration-200 flex items-center justify-center",
              "hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400",
              !calDay.isCurrentMonth &&
                "text-gray-300 dark:text-slate-600 hover:text-gray-400 dark:hover:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800",
              calDay.isToday &&
                "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-200 dark:ring-blue-700",
              calDay.isSelected &&
                "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            )}
          >
            {calDay.day}
          </button>
        ))}
      </div>
    </div>
  );
};

const InvoiceForm = ({
  company_data,
  client_data,
  clients,
}: {
  company_data: BusinessType;
  client_data?: ClientType;
  clients?: ClientType[];
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: "INV0001",
      company_details: company_data,
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
      currency: "GBP",
      client_id: client_data?.id || undefined,
      business_id: company_data.id,
    },
  });

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

    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount + shipping;

    form.setValue("subtotal", subtotal);
    form.setValue("total", total);
  }, [items, discount, shipping]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Add status field before sending to backend
    const invoiceData = {
      ...values,
      status: "draft" as const,
      currency: normalizeCurrencyCode(values.currency),
    };
    const invoice = await createInvoice(invoiceData as any);
    if (invoice && invoice.id) {
      const redirectUrl = `/dashboard/invoices/success?invoice_id=${invoice.id}&business_id=${company_data.id}`;
      redirect(redirectUrl);
    } else {
      console.log("Failed to create an invoice or no ID returned");
      redirect(`/dashboard`);
    }
  };

  console.log(form.formState.errors);

  return (
    <div className="bg-white dark:bg-slate-800">
      {/* @ts-ignore - Form control type mismatch with resolver, functionally correct */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-8 space-y-12 text-gray-900 dark:text-slate-100"
        >
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
                        className="w-full h-full object-contain p-2"
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
                            defaultValue={String(field.value)}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Link
                        href={`/dashboard/clients?business_id=${company_data.id}`}
                      >
                        Create New Client
                      </Link>
                    </Button>
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
                    <InvoiceItems />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Details & Summary */}
          <div className="border-t border-gray-100 dark:border-slate-700 pt-12">
            <div className="flex w-full gap-12">
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

              <div className="w-80">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
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
                            Shipping (£)
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
            <div className="flex justify-end">
              <CustomButton
                type="submit"
                label="Create Invoice"
                variant="primary"
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InvoiceForm;
