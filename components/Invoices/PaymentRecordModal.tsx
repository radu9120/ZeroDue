"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  X,
  Loader2,
  Plus,
  CheckCircle,
} from "lucide-react";
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
import ModalPortal from "@/components/ui/ModalPortal";
import { recordPayment } from "@/lib/actions/payment.actions";
import { toast } from "sonner";

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const paymentMethods = [
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "other", label: "Other", icon: Wallet },
];

interface PaymentRecordModalProps {
  invoiceId: number;
  businessId: number;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  currency?: string;
  onPaymentRecorded?: () => void;
  trigger?: React.ReactNode;
}

export default function PaymentRecordModal({
  invoiceId,
  businessId,
  invoiceNumber,
  totalAmount,
  amountPaid,
  currency = "GBP",
  onPaymentRecorded,
  trigger,
}: PaymentRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingBalance = totalAmount - amountPaid;
  const currencySymbol =
    currency === "GBP" ? "£" : currency === "USD" ? "$" : "€";

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "card",
      reference_number: "",
      notes: "",
    },
  });

  const onSubmit = async (values: PaymentForm) => {
    if (values.amount > remainingBalance) {
      toast.error(
        `Payment cannot exceed remaining balance of ${currencySymbol}${remainingBalance.toFixed(2)}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment({
        invoice_id: invoiceId,
        business_id: businessId,
        amount: values.amount,
        payment_date: values.payment_date,
        payment_method: values.payment_method,
        transaction_id: values.reference_number,
        notes: values.notes,
      });
      toast.success("Payment recorded successfully!");
      setIsOpen(false);
      form.reset();
      onPaymentRecorded?.();
    } catch (error) {
      toast.error("Failed to record payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Record Payment
        </Button>
      )}

      {/* Modal */}
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Record Payment
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Invoice #{invoiceNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Balance Summary */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Total
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {currencySymbol}
                      {totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Paid
                    </p>
                    <p className="font-semibold text-emerald-600">
                      {currencySymbol}
                      {amountPaid.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Remaining
                    </p>
                    <p className="font-semibold text-amber-600">
                      {currencySymbol}
                      {remainingBalance.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                      style={{
                        width: `${Math.min((amountPaid / totalAmount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                    {Math.round((amountPaid / totalAmount) * 100)}% paid
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Amount and Date */}
                    <div className="grid grid-cols-2 gap-4">
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
                                  {currencySymbol}
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
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
                        name="payment_date"
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

                    {/* Payment Method */}
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Payment Method *
                          </FormLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {paymentMethods.map((method) => {
                              const Icon = method.icon;
                              const isSelected = field.value === method.value;
                              return (
                                <button
                                  key={method.value}
                                  type="button"
                                  onClick={() => field.onChange(method.value)}
                                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                  }`}
                                >
                                  <Icon
                                    className={`h-5 w-5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`}
                                  />
                                  <span
                                    className={`text-xs ${isSelected ? "text-emerald-600 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                                  >
                                    {method.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reference Number */}
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Reference / Transaction ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., TXN-12345"
                              {...field}
                              className="dark:bg-slate-800 dark:border-slate-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              className="dark:bg-slate-800 dark:border-slate-700 min-h-[60px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="neutralOutline"
                        size="sm"
                        onClick={() =>
                          form.setValue("amount", remainingBalance)
                        }
                        className="text-xs"
                      >
                        Full Balance
                      </Button>
                      <Button
                        type="button"
                        variant="neutralOutline"
                        size="sm"
                        onClick={() =>
                          form.setValue("amount", remainingBalance / 2)
                        }
                        className="text-xs"
                      >
                        50%
                      </Button>
                      <Button
                        type="button"
                        variant="neutralOutline"
                        size="sm"
                        onClick={() =>
                          form.setValue("amount", remainingBalance * 0.25)
                        }
                        className="text-xs"
                      >
                        25%
                      </Button>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="neutralOutline"
                        className="flex-1"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Recording...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Record Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
