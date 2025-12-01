"use server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createActivity } from "./userActivity.actions";
import { revalidatePath } from "next/cache";
import type { InvoicePayment } from "@/types";

export interface RecordPaymentInput {
  invoice_id: number;
  business_id: number;
  amount: number;
  currency?: string;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
}

export async function recordPayment(input: RecordPaymentInput) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Get invoice details first
  const { data: invoice, error: invoiceError } = await supabase
    .from("Invoices")
    .select("invoice_number, total, amount_paid, status")
    .eq("id", input.invoice_id)
    .single();

  if (invoiceError || !invoice) throw new Error("Invoice not found");

  const { data, error } = await supabase
    .from("InvoicePayments")
    .insert({
      ...input,
      currency: input.currency || "GBP",
      payment_date:
        input.payment_date || new Date().toISOString().split("T")[0],
      payment_method: input.payment_method || "other",
      created_by: author,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Note: The trigger will automatically update invoice.amount_paid and payment_status

  await createActivity({
    user_id: author,
    business_id: input.business_id,
    action: "Recorded payment",
    target_type: "payment",
    target_name: `${input.amount} on ${invoice.invoice_number}`,
  });

  revalidatePath("/dashboard/invoices");
  return data as InvoicePayment;
}

export async function getInvoicePayments(invoice_id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("InvoicePayments")
    .select("*")
    .eq("invoice_id", invoice_id)
    .order("payment_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data as InvoicePayment[];
}

// Alias for getInvoicePayments for backwards compatibility
export async function getPaymentHistory(invoice_id: number) {
  return getInvoicePayments(invoice_id);
}

export async function getBusinessPayments(
  business_id: number,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  let query = supabase
    .from("InvoicePayments")
    .select(
      `
      *,
      invoice:Invoices(id, invoice_number, bill_to)
    `
    )
    .eq("business_id", business_id)
    .order("payment_date", { ascending: false });

  if (options?.startDate) {
    query = query.gte("payment_date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("payment_date", options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePayment(id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { error } = await supabase
    .from("InvoicePayments")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Note: The trigger will automatically recalculate invoice totals

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function getPaymentMethods() {
  return [
    { value: "stripe", label: "Stripe", icon: "credit-card" },
    { value: "paypal", label: "PayPal", icon: "paypal" },
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: "building-columns",
    },
    { value: "cash", label: "Cash", icon: "banknotes" },
    { value: "check", label: "Cheque", icon: "document-check" },
    { value: "other", label: "Other", icon: "ellipsis" },
  ];
}
