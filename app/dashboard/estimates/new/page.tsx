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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/estimates?business_id=${businessId}`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Estimates
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                New Estimate
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Create a quote for your client
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Client Selection */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Client *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingClients ? (
                          <div className="p-2 text-center text-slate-500">
                            Loading...
                          </div>
                        ) : clients.length === 0 ? (
                          <div className="p-2 text-center text-slate-500">
                            No clients found.{" "}
                            <Link
                              href={`/dashboard/clients/new?business_id=${businessId}`}
                              className="text-purple-600 hover:underline"
                            >
                              Add one
                            </Link>
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                {client.name}
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
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Website redesign project"
                        {...field}
                        className="dark:bg-slate-800 dark:border-slate-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates and Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Issue Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="dark:bg-slate-800 dark:border-slate-700"
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
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Valid Until
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="dark:bg-slate-800 dark:border-slate-700"
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
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Currency
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FormLabel className="text-slate-700 dark:text-slate-300">
                    Line Items *
                  </FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      append({ description: "", quantity: 1, rate: 0 })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <Input
                          placeholder="Description"
                          {...form.register(`items.${index}.description`)}
                          className="dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          {...form.register(`items.${index}.quantity`)}
                          className="dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {currencySymbol}
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Rate"
                            {...form.register(`items.${index}.rate`)}
                            className="pl-7 dark:bg-slate-800 dark:border-slate-700"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {currencySymbol}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Discount</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...form.register("discount")}
                        className="w-16 h-8 text-right dark:bg-slate-800 dark:border-slate-700"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Discount Amount</span>
                      <span>
                        -{currencySymbol}
                        {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-slate-100">
                      Total
                    </span>
                    <span className="text-purple-600">
                      {currencySymbol}
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or terms..."
                        {...field}
                        className="dark:bg-slate-800 dark:border-slate-700 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="neutralOutline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Estimate
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
