"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Receipt,
  ArrowLeft,
  Upload,
  Plane,
  Utensils,
  Briefcase,
  Laptop,
  Wrench,
  Megaphone,
  Zap,
  Home,
  Shield,
  Users,
  Folder,
  Loader2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { createExpense } from "@/lib/actions/expense.actions";
import { toast } from "sonner";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  expense_date: z.string().min(1, "Date is required"),
  vendor: z.string().optional(),
  payment_method: z.string().optional(),
  is_billable: z.boolean().default(false),
  is_tax_deductible: z.boolean().default(true),
  notes: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

const categories = [
  { value: "travel", label: "Travel", icon: Plane, color: "text-blue-500" },
  {
    value: "meals",
    label: "Meals & Entertainment",
    icon: Utensils,
    color: "text-orange-500",
  },
  {
    value: "office",
    label: "Office Supplies",
    icon: Briefcase,
    color: "text-slate-500",
  },
  {
    value: "software",
    label: "Software & Tools",
    icon: Laptop,
    color: "text-purple-500",
  },
  {
    value: "equipment",
    label: "Equipment",
    icon: Wrench,
    color: "text-slate-600",
  },
  {
    value: "marketing",
    label: "Marketing",
    icon: Megaphone,
    color: "text-pink-500",
  },
  {
    value: "utilities",
    label: "Utilities",
    icon: Zap,
    color: "text-yellow-500",
  },
  { value: "rent", label: "Rent & Lease", icon: Home, color: "text-green-500" },
  {
    value: "insurance",
    label: "Insurance",
    icon: Shield,
    color: "text-cyan-500",
  },
  {
    value: "professional_services",
    label: "Professional Services",
    icon: Users,
    color: "text-indigo-500",
  },
  { value: "other", label: "Other", icon: Folder, color: "text-slate-400" },
];

const paymentMethods = [
  { value: "card", label: "Credit/Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "paypal", label: "PayPal" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Other" },
];

export default function NewExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business_id");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
      expense_date: new Date().toISOString().split("T")[0],
      vendor: "",
      payment_method: "card",
      is_billable: false,
      is_tax_deductible: true,
      notes: "",
    },
  });

  const onSubmit = async (values: ExpenseForm) => {
    if (!businessId) {
      toast.error("Business ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        business_id: parseInt(businessId),
        ...values,
      });
      toast.success("Expense added successfully!");
      router.push(`/dashboard/expenses?business_id=${businessId}`);
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/expenses?business_id=${businessId}`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Expenses
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Add Expense
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Record a new business expense
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Description *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Client lunch meeting"
                        {...field}
                        className="dark:bg-slate-800 dark:border-slate-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Amount *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            £
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            className="pl-7 dark:bg-slate-800 dark:border-slate-700"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expense_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Date *
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
              </div>

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Category *
                    </FormLabel>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = field.value === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => field.onChange(cat.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${cat.color}`} />
                            <span className="text-xs text-slate-600 dark:text-slate-400 text-center">
                              {cat.label.split(" ")[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vendor and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Vendor / Merchant
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Amazon, Uber"
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
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Payment Method
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <FormField
                  control={form.control}
                  name="is_billable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-slate-700 dark:text-slate-300 !mt-0 cursor-pointer">
                        Billable to client
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_tax_deductible"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-slate-700 dark:text-slate-300 !mt-0 cursor-pointer">
                        Tax deductible
                      </FormLabel>
                    </FormItem>
                  )}
                />
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
                        placeholder="Additional details..."
                        {...field}
                        className="dark:bg-slate-800 dark:border-slate-700 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receipt Upload (placeholder) */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drag & drop receipt image, or click to upload
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>

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
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Add Expense
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
