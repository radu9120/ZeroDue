"use server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createActivity } from "./userActivity.actions";
import { revalidatePath } from "next/cache";
import type { RecurringInvoice } from "@/types";

export interface CreateRecurringInvoiceInput {
  business_id: number;
  client_id: number;
  invoice_template?: string;
  description?: string;
  items: any[];
  notes?: string;
  bank_details?: string;
  currency: string;
  discount?: number;
  shipping?: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date?: string;
  day_of_month?: number;
  day_of_week?: number;
  payment_terms?: number;
  auto_send?: boolean;
}

// Calculate next invoice date based on frequency
function calculateNextDate(
  startDate: Date,
  frequency: string,
  dayOfMonth?: number,
  dayOfWeek?: number,
): Date {
  const next = new Date(startDate);

  switch (frequency) {
    case "weekly":
      if (dayOfWeek !== undefined) {
        const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
      } else {
        next.setDate(next.getDate() + 7);
      }
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      if (dayOfMonth) {
        next.setDate(
          Math.min(
            dayOfMonth,
            new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate(),
          ),
        );
      }
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      if (dayOfMonth) {
        next.setDate(
          Math.min(
            dayOfMonth,
            new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate(),
          ),
        );
      }
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

export async function createRecurringInvoice(
  input: CreateRecurringInvoiceInput,
) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  const startDate = new Date(input.start_date);
  const nextInvoiceDate =
    startDate > new Date()
      ? startDate
      : calculateNextDate(
          new Date(),
          input.frequency,
          input.day_of_month,
          input.day_of_week,
        );

  const { data, error } = await supabase
    .from("RecurringInvoices")
    .insert({
      ...input,
      author,
      next_invoice_date: nextInvoiceDate.toISOString().split("T")[0],
      payment_terms: input.payment_terms || 30,
      auto_send: input.auto_send || false,
      status: "active",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await createActivity({
    user_id: author,
    business_id: input.business_id,
    action: "Created recurring invoice",
    target_type: "recurring",
    target_name: `${input.frequency} - ${input.description || "Recurring Invoice"}`,
  });

  revalidatePath("/dashboard/invoices");
  return data as RecurringInvoice;
}

export async function getRecurringInvoices(business_id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("RecurringInvoices")
    .select(
      `
      *,
      client:Clients(id, name, email),
      business:Businesses(id, name)
    `,
    )
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as RecurringInvoice[];
}

export async function updateRecurringInvoice(
  id: number,
  updates: Partial<CreateRecurringInvoiceInput> & { status?: string },
) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("RecurringInvoices")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (updates.status === "paused") {
    await createActivity({
      user_id: author,
      business_id: data.business_id,
      action: "Paused recurring invoice",
      target_type: "recurring",
      target_name: data.description || "Recurring Invoice",
    });
  }

  revalidatePath("/dashboard/invoices");
  return data as RecurringInvoice;
}

export async function deleteRecurringInvoice(id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { error } = await supabase
    .from("RecurringInvoices")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

// Generate invoice from recurring template
export async function generateInvoiceFromRecurring(recurringId: number) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Get the recurring invoice
  const { data: recurring, error: fetchError } = await supabase
    .from("RecurringInvoices")
    .select("*, client:Clients(*), business:Businesses(*)")
    .eq("id", recurringId)
    .single();

  if (fetchError || !recurring) throw new Error("Recurring invoice not found");

  // Calculate invoice number
  const { data: lastInvoice } = await supabase
    .from("Invoices")
    .select("invoice_number")
    .eq("business_id", recurring.business_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastNum = lastInvoice?.invoice_number?.match(/(\d+)$/)?.[1] || "0";
  const nextNum = String(parseInt(lastNum) + 1).padStart(4, "0");
  const invoiceNumber = `INV${nextNum}`;

  // Calculate dates
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (recurring.payment_terms || 30));

  // Calculate totals
  const items = recurring.items || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const tax = Number(item.tax || 0);
    return sum + qty * price * (1 + tax / 100);
  }, 0);

  const discountAmount = subtotal * ((recurring.discount || 0) / 100);
  const total = subtotal - discountAmount + (recurring.shipping || 0);

  // Create the invoice
  const { data: invoice, error: createError } = await supabase
    .from("Invoices")
    .insert({
      business_id: recurring.business_id,
      client_id: recurring.client_id,
      author,
      invoice_number: invoiceNumber,
      description: recurring.description,
      items: recurring.items,
      notes: recurring.notes,
      bank_details: recurring.bank_details,
      currency: recurring.currency,
      subtotal,
      discount: recurring.discount,
      shipping: recurring.shipping,
      total,
      issue_date: issueDate.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      status: "draft",
      invoice_template: recurring.invoice_template,
      company_details: {
        name: recurring.business?.name,
        email: recurring.business?.email,
        address: recurring.business?.address,
        phone: recurring.business?.phone,
        vat: recurring.business?.vat,
      },
      bill_to: {
        id: recurring.client?.id,
        name: recurring.client?.name,
        email: recurring.client?.email,
        address: recurring.client?.address,
        phone: recurring.client?.phone,
      },
    })
    .select()
    .single();

  if (createError) throw new Error(createError.message);

  // Update recurring invoice
  const nextDate = calculateNextDate(
    new Date(),
    recurring.frequency,
    recurring.day_of_month,
    recurring.day_of_week,
  );

  await supabase
    .from("RecurringInvoices")
    .update({
      invoices_generated: (recurring.invoices_generated || 0) + 1,
      last_invoice_id: invoice.id,
      last_generated_at: new Date().toISOString(),
      next_invoice_date: nextDate.toISOString().split("T")[0],
      status:
        recurring.end_date && nextDate > new Date(recurring.end_date)
          ? "completed"
          : "active",
    })
    .eq("id", recurringId);

  await createActivity({
    user_id: author,
    business_id: recurring.business_id,
    action: "Generated recurring invoice",
    target_type: "invoice",
    target_name: invoiceNumber,
  });

  revalidatePath("/dashboard/invoices");
  return invoice;
}
