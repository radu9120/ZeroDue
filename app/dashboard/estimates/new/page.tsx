"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEstimate } from "@/lib/actions/estimate.actions";
import { getClients } from "@/lib/actions/client.actions";
import { toast } from "sonner";

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(1, "Min 1"),
  rate: z.coerce.number().min(0, "Min 0"),
});

const estimateSchema = z.object({
  client_id: z.coerce.number().min(1, "Select a client"),
  description: z.string().optional(),
  issue_date: z.string().min(1, "Issue date required"),
  valid_until: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  notes: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).default(0),
  currency: z.string().default("GBP"),
});

type EstimateForm = z.infer<typeof estimateSchema>;

interface Client {
  id: number;
  name: string;
  email: string;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business_id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const form = useForm<EstimateForm>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      client_id: 0,
      description: "",
      issue_date: new Date().toISOString().split("T")[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [{ description: "", quantity: 1, rate: 0 }],
      notes: "",
      discount: 0,
      currency: "GBP",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    const fetchClients = async () => {
      if (!businessId) return;
      try {
        const data = await getClients({ business_id: parseInt(businessId) });
        setClients(data || []);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [businessId]);

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount");

  const subtotal = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
    0
  );
  const discountAmount = subtotal * ((watchedDiscount || 0) / 100);
  const total = subtotal - discountAmount;

  const currencySymbol =
    form.watch("currency") === "GBP"
      ? "£"
      : form.watch("currency") === "USD"
        ? "$"
        : "€";

  const onSubmit = async (values: EstimateForm) => {
    if (!businessId) {
      toast.error("Business ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEstimate({
        business_id: parseInt(businessId),
        client_id: values.client_id,
        description: values.description,
        valid_until: values.valid_until,
        items: values.items,
        notes: values.notes,
        discount: values.discount,
        currency: values.currency,
      });
      toast.success("Estimate created successfully!");
      router.push(`/dashboard/estimates?business_id=${businessId}`);
    } catch (error) {
      toast.error("Failed to create estimate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-[#0B1120] dark:via-purple-950/10 dark:to-[#0B1120] py-6 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/dashboard/estimates?business_id=${businessId}`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Estimates
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 text-white">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Create New Estimate
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Build a professional quote for your client
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Section: Client & Project Info */}
              <div className="p-6 sm:p-8 border-b border-slate-200/60 dark:border-slate-800/60">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  Client & Project Details
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Client Selection */}
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Select Client *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl">
                              <SelectValue placeholder="Choose a client..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingClients ? (
                              <div className="p-3 text-center text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                Loading clients...
                              </div>
                            ) : clients.length === 0 ? (
                              <div className="p-3 text-center text-slate-500">
                                No clients found.{" "}
                                <Link
                                  href={`/dashboard/clients/new?business_id=${businessId}`}
                                  className="text-purple-600 hover:underline font-medium"
                                >
                                  Add your first client
                                </Link>
                              </div>
                            ) : (
                              clients.map((client) => (
                                <SelectItem
                                  key={client.id}
                                  value={client.id.toString()}
                                >
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-400" />
                                    <span>{client.name}</span>
                                    <span className="text-slate-400 text-xs">
                                      ({client.email})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Project Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Website Redesign Project"
                            {...field}
                            className="h-12 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section: Dates & Currency */}
              <div className="p-6 sm:p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Timeline & Currency
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="issue_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Issue Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-12 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valid_until"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Valid Until
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-12 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl"
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
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          Currency
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GBP">
                              £ GBP - British Pound
                            </SelectItem>
                            <SelectItem value="USD">
                              $ USD - US Dollar
                            </SelectItem>
                            <SelectItem value="EUR">€ EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section: Line Items */}
              <div className="p-6 sm:p-8 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-purple-500" />
                    Line Items
                  </h2>
                  <Button
                    type="button"
                    variant="neutralOutline"
                    size="sm"
                    onClick={() =>
                      append({ description: "", quantity: 1, rate: 0 })
                    }
                    className="gap-1.5 rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="group relative grid grid-cols-12 gap-3 sm:gap-4 items-start p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-200 dark:hover:border-purple-800/50 transition-colors"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                          Description
                        </label>
                        <Input
                          placeholder="What are you providing?"
                          {...form.register(`items.${index}.description`)}
                          className="h-11 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                          Qty
                        </label>
                        <Input
                          type="number"
                          placeholder="1"
                          {...form.register(`items.${index}.quantity`)}
                          className="h-11 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg text-center"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                          Rate
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                            {currencySymbol}
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...form.register(`items.${index}.rate`)}
                            className="h-11 pl-8 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-end justify-end pb-0.5">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-11 w-11 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Summary & Notes */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-50/50 to-slate-50 dark:from-purple-950/20 dark:to-slate-900/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Notes */}
                  <div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                            Notes & Terms
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add payment terms, special conditions, or additional notes..."
                              {...field}
                              className="dark:bg-slate-800/50 dark:border-slate-700 min-h-[140px] rounded-xl resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Totals */}
                  <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                          Subtotal
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {currencySymbol}
                          {subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                          Discount
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...form.register("discount")}
                            className="w-20 h-9 text-right dark:bg-slate-700/50 dark:border-slate-600 rounded-lg"
                          />
                          <span className="text-slate-400 text-sm">%</span>
                        </div>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-500">
                          <span>Discount Applied</span>
                          <span>
                            -{currencySymbol}
                            {discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xl font-bold pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">
                          {currencySymbol}
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-800/30 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    type="button"
                    variant="neutralOutline"
                    size="lg"
                    className="sm:w-auto w-full rounded-xl"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="sm:w-auto w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl shadow-lg shadow-purple-500/25"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Estimate...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Create Estimate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
