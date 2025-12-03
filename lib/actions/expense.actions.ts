"use server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createActivity } from "./userActivity.actions";
import { revalidatePath } from "next/cache";
import type { Expense, ExpenseCategory } from "@/types";
import { getCurrentPlan } from "@/lib/plan";
import { type AppPlan } from "@/lib/utils";

export interface CreateExpenseInput {
  business_id: number;
  description: string;
  amount: number;
  currency?: string;
  category: string;
  expense_date: string;
  vendor?: string;
  receipt_url?: string;
  receipt_filename?: string;
  client_id?: number;
  project_name?: string;
  is_billable?: boolean;
  tax_amount?: number;
  tax_rate?: number;
  is_tax_deductible?: boolean;
  payment_method?: string;
  notes?: string;
}

export async function createExpense(input: CreateExpenseInput) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Enforce plan limits before insert
  try {
    const plan: AppPlan = await getCurrentPlan();
    const businessId = input.business_id;

    // Get business extra expense credits
    const { data: business } = await supabase
      .from("Businesses")
      .select("extra_expense_credits")
      .eq("id", businessId)
      .single();

    const extraCredits = business?.extra_expense_credits || 0;

    if (plan === "free_user") {
      // Free plan: Pay-as-you-go at £0.20 per expense
      if (extraCredits <= 0) {
        return {
          error:
            "NEEDS_PAYMENT:Expenses require payment on Free plan. Purchase expense credits (£0.20 each) to continue.",
        };
      }

      // Decrement credits
      const { error: creditError } = await supabase.rpc(
        "decrement_expense_credits",
        { business_id_param: businessId }
      );

      if (creditError?.code === "PGRST202") {
        // RPC not found - use optimistic update
        const { data: updated, error: updateError } = await supabase
          .from("Businesses")
          .update({ extra_expense_credits: extraCredits - 1 })
          .eq("id", businessId)
          .gt("extra_expense_credits", 0)
          .select("extra_expense_credits")
          .single();

        if (updateError || !updated) {
          return {
            error:
              "NEEDS_PAYMENT:Unable to use expense credit. Please try again or purchase more credits.",
          };
        }
      } else if (creditError) {
        console.error("Failed to decrement expense credits:", creditError);
        return {
          error:
            "NEEDS_PAYMENT:Unable to use expense credit. Please try again.",
        };
      }
    } else if (plan === "professional") {
      // Professional plan: 10 expenses per month, then pay-as-you-go at £0.20
      const now = new Date();
      const firstDayISO = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const nextMonthISO = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ).toISOString();

      const { count } = await supabase
        .from("Expenses")
        .select("id", { count: "exact", head: true })
        .eq("author", author)
        .eq("business_id", businessId)
        .gte("created_at", firstDayISO)
        .lt("created_at", nextMonthISO);

      const monthlyCount = count || 0;
      const monthlyLimit = 10;

      if (monthlyCount >= monthlyLimit && extraCredits <= 0) {
        return {
          error:
            "NEEDS_PAYMENT:You've reached your 10 expenses this month. Purchase additional credits (£0.20 each) or upgrade to Enterprise.",
        };
      }

      // If using extra credits, decrement
      if (monthlyCount >= monthlyLimit && extraCredits > 0) {
        const { error: creditError } = await supabase.rpc(
          "decrement_expense_credits",
          { business_id_param: businessId }
        );

        if (creditError?.code === "PGRST202") {
          const { data: updated, error: updateError } = await supabase
            .from("Businesses")
            .update({ extra_expense_credits: extraCredits - 1 })
            .eq("id", businessId)
            .gt("extra_expense_credits", 0)
            .select("extra_expense_credits")
            .single();

          if (updateError || !updated) {
            return {
              error:
                "NEEDS_PAYMENT:Unable to use expense credit. Please try again or purchase more credits.",
            };
          }
        } else if (creditError) {
          console.error("Failed to decrement expense credits:", creditError);
          return {
            error:
              "NEEDS_PAYMENT:Unable to use expense credit. Please try again.",
          };
        }
      }
    }
    // Enterprise plan: unlimited expenses, no checks needed
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Plan validation failed.",
    };
  }

  const { data, error } = await supabase
    .from("Expenses")
    .insert({
      ...input,
      author,
      currency: input.currency || "GBP",
      is_billable: input.is_billable || false,
      is_billed: false,
      is_tax_deductible: input.is_tax_deductible !== false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await createActivity({
    user_id: author,
    business_id: input.business_id,
    action: "Created expense",
    target_type: "expense",
    target_name: input.description,
  });

  revalidatePath("/dashboard/expenses");
  return data as Expense;
}

export async function getExpenses(
  business_id: number,
  options?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    is_billable?: boolean;
    client_id?: number;
    limit?: number;
    page?: number;
  }
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  let query = supabase
    .from("Expenses")
    .select(
      `
      *,
      client:Clients(id, name)
    `
    )
    .eq("business_id", business_id)
    .order("expense_date", { ascending: false });

  if (options?.startDate) {
    query = query.gte("expense_date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("expense_date", options.endDate);
  }
  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.is_billable !== undefined) {
    query = query.eq("is_billable", options.is_billable);
  }
  if (options?.client_id) {
    query = query.eq("client_id", options.client_id);
  }
  if (options?.limit) {
    const page = options.page || 1;
    query = query.range((page - 1) * options.limit, page * options.limit - 1);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data as Expense[];
}

export async function getExpenseStats(
  business_id: number,
  startDate?: string,
  endDate?: string
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  let query = supabase
    .from("Expenses")
    .select("amount, category, is_billable, is_tax_deductible")
    .eq("business_id", business_id);

  if (startDate) query = query.gte("expense_date", startDate);
  if (endDate) query = query.lte("expense_date", endDate);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const expenses = data || [];

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const billableExpenses = expenses
    .filter((e) => e.is_billable)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const taxDeductible = expenses
    .filter((e) => e.is_tax_deductible)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // By category
  const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  return {
    totalExpenses,
    billableExpenses,
    taxDeductible,
    byCategory,
    count: expenses.length,
  };
}

export async function updateExpense(
  id: number,
  updates: Partial<CreateExpenseInput>
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Expenses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/expenses");
  return data as Expense;
}

export async function deleteExpense(id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { error } = await supabase.from("Expenses").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/expenses");
  return { success: true };
}

export async function getExpenseCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ExpenseCategories")
    .select("*")
    .order("name");

  if (error) {
    // Return default categories if table doesn't exist
    return [
      { id: 1, name: "travel", icon: "plane", color: "blue", is_default: true },
      {
        id: 2,
        name: "meals",
        icon: "utensils",
        color: "orange",
        is_default: true,
      },
      {
        id: 3,
        name: "office",
        icon: "briefcase",
        color: "gray",
        is_default: true,
      },
      {
        id: 4,
        name: "software",
        icon: "laptop",
        color: "purple",
        is_default: true,
      },
      {
        id: 5,
        name: "equipment",
        icon: "wrench",
        color: "slate",
        is_default: true,
      },
      {
        id: 6,
        name: "marketing",
        icon: "megaphone",
        color: "pink",
        is_default: true,
      },
      {
        id: 7,
        name: "utilities",
        icon: "zap",
        color: "yellow",
        is_default: true,
      },
      { id: 8, name: "rent", icon: "home", color: "green", is_default: true },
      {
        id: 9,
        name: "insurance",
        icon: "shield",
        color: "cyan",
        is_default: true,
      },
      {
        id: 10,
        name: "professional_services",
        icon: "users",
        color: "indigo",
        is_default: true,
      },
      {
        id: 11,
        name: "other",
        icon: "folder",
        color: "gray",
        is_default: true,
      },
    ] as ExpenseCategory[];
  }

  return data as ExpenseCategory[];
}

// Add expense to invoice as line item
export async function addExpenseToInvoice(
  expenseId: number,
  invoiceId: number
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  // Get the expense
  const { data: expense, error: expenseError } = await supabase
    .from("Expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (expenseError || !expense) throw new Error("Expense not found");

  // Get the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("Invoices")
    .select("items, subtotal, total, discount, shipping")
    .eq("id", invoiceId)
    .single();

  if (invoiceError || !invoice) throw new Error("Invoice not found");

  // Add expense as line item
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  items.push({
    description: `Expense: ${expense.description}`,
    quantity: 1,
    unit_price: expense.amount,
    tax: expense.tax_rate || 0,
    amount: expense.amount + (expense.tax_amount || 0),
  });

  // Recalculate totals
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0),
    0
  );
  const discountAmount = subtotal * ((invoice.discount || 0) / 100);
  const total = subtotal - discountAmount + (invoice.shipping || 0);

  // Update invoice
  await supabase
    .from("Invoices")
    .update({ items, subtotal, total })
    .eq("id", invoiceId);

  // Mark expense as billed
  await supabase
    .from("Expenses")
    .update({ is_billed: true, invoice_id: invoiceId })
    .eq("id", expenseId);

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/expenses");

  return { success: true };
}

// Get monthly expense count for current user
export async function getCurrentMonthExpenseCount(businessId: number) {
  const { userId } = await auth();
  if (!userId) return { count: 0, limit: 0, plan: "free_user" as AppPlan };

  const supabase = await createClient();
  const plan: AppPlan = await getCurrentPlan();

  const now = new Date();
  const firstDayISO = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const nextMonthISO = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  ).toISOString();

  const { count } = await supabase
    .from("Expenses")
    .select("id", { count: "exact", head: true })
    .eq("author", userId)
    .eq("business_id", businessId)
    .gte("created_at", firstDayISO)
    .lt("created_at", nextMonthISO);

  // Get extra credits
  const { data: business } = await supabase
    .from("Businesses")
    .select("extra_expense_credits")
    .eq("id", businessId)
    .single();

  const extraCredits = business?.extra_expense_credits || 0;

  // Free plan: pay-per-expense (no free limit), Professional: 10/month, Enterprise: unlimited
  const limit =
    plan === "free_user" ? 0 : plan === "professional" ? 10 : Infinity;

  return {
    count: count || 0,
    limit,
    plan,
    extraCredits,
  };
}
