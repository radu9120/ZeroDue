"use server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoice } from "@/schemas/invoiceSchema";
import { BusinessDashboardPageProps, InvoiceListItem } from "@/types";
import { createActivity } from "./userActivity.actions";
import { redirect } from "next/navigation";
import { type AppPlan } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/plan";
import { revalidatePath } from "next/cache";
import { getBusinessById } from "./business.actions";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_INVOICE_PREFIX = "INV";
const DEFAULT_PADDING = 4;

const formatInvoiceNumber = (sequence: number) => {
  const padded = String(Math.max(sequence, 1)).padStart(DEFAULT_PADDING, "0");
  return `${DEFAULT_INVOICE_PREFIX}${padded}`;
};

const extractInvoiceSequence = (invoiceNumber?: string | null) => {
  if (!invoiceNumber) return 0;
  const match = invoiceNumber.match(/(\d+)$/);
  if (!match) return 0;
  const parsed = parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createInvoice = async (formData: CreateInvoice) => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Enforce plan limits before insert
  try {
    const plan: AppPlan = await getCurrentPlan();
    const businessId = formData.business_id;

    // Get business extra invoice credits
    const { data: business } = await supabase
      .from("Businesses")
      .select("extra_invoice_credits")
      .eq("id", businessId)
      .single();

    const extraCredits = business?.extra_invoice_credits || 0;

    if (plan === "free_user") {
      // Free plan: 2 free invoices total, then pay-as-you-go
      const { count, error: countError } = await supabase
        .from("Invoices")
        .select("id", { count: "exact", head: true })
        .eq("author", author)
        .eq("business_id", businessId);

      console.log(
        "[createInvoice] Free plan check - author:",
        author,
        "businessId:",
        businessId,
        "count:",
        count,
        "countError:",
        countError
      );

      // If count is null/undefined and no error, assume 0 invoices
      // This can happen with RLS or when table is empty for this user
      const totalInvoices = typeof count === "number" ? count : 0;
      const freeLimit = 2;

      console.log(
        "[createInvoice] totalInvoices:",
        totalInvoices,
        "freeLimit:",
        freeLimit,
        "extraCredits:",
        extraCredits
      );

      if (totalInvoices >= freeLimit && extraCredits <= 0) {
        console.log("[createInvoice] BLOCKING - Limit reached");
        return {
          error:
            "NEEDS_PAYMENT:You've used your 2 free invoices. Purchase additional invoice credits ($0.99 each) to continue.",
        };
      }

      console.log("[createInvoice] ALLOWING - Under limit or has credits");

      // If using extra credits, decrement atomically to prevent race conditions
      if (totalInvoices >= freeLimit && extraCredits > 0) {
        const { error: creditError } = await supabase.rpc(
          "decrement_invoice_credits",
          { business_id_param: businessId }
        );
        // If RPC doesn't exist, fall back to regular update with re-check
        if (creditError?.code === "PGRST202") {
          // RPC not found - use optimistic update with verification
          const { data: updated, error: updateError } = await supabase
            .from("Businesses")
            .update({ extra_invoice_credits: extraCredits - 1 })
            .eq("id", businessId)
            .gt("extra_invoice_credits", 0)
            .select("extra_invoice_credits")
            .single();

          if (updateError || !updated) {
            return {
              error:
                "NEEDS_PAYMENT:Unable to use invoice credit. Please try again or purchase more credits.",
            };
          }
        } else if (creditError) {
          console.error("Failed to decrement credits:", creditError);
          return {
            error:
              "NEEDS_PAYMENT:Unable to use invoice credit. Please try again.",
          };
        }
      }
    } else if (plan === "professional") {
      // Professional plan: 15 invoices per month, then pay-as-you-go at $0.49
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
        .from("Invoices")
        .select("id", { count: "exact", head: true })
        .eq("author", author)
        .eq("business_id", businessId)
        .gte("created_at", firstDayISO)
        .lt("created_at", nextMonthISO);

      const monthlyCount = count || 0;
      const monthlyLimit = 15;

      if (monthlyCount >= monthlyLimit && extraCredits <= 0) {
        return {
          error:
            "NEEDS_PAYMENT:You've reached your 15 invoices this month. Purchase additional credits ($0.49 each) or upgrade to Enterprise.",
        };
      }

      // If using extra credits, decrement atomically to prevent race conditions
      if (monthlyCount >= monthlyLimit && extraCredits > 0) {
        const { error: creditError } = await supabase.rpc(
          "decrement_invoice_credits",
          { business_id_param: businessId }
        );
        // If RPC doesn't exist, fall back to regular update with re-check
        if (creditError?.code === "PGRST202") {
          // RPC not found - use optimistic update with verification
          const { data: updated, error: updateError } = await supabase
            .from("Businesses")
            .update({ extra_invoice_credits: extraCredits - 1 })
            .eq("id", businessId)
            .gt("extra_invoice_credits", 0)
            .select("extra_invoice_credits")
            .single();

          if (updateError || !updated) {
            return {
              error:
                "NEEDS_PAYMENT:Unable to use invoice credit. Please try again or purchase more credits.",
            };
          }
        } else if (creditError) {
          console.error("Failed to decrement credits:", creditError);
          return {
            error:
              "NEEDS_PAYMENT:Unable to use invoice credit. Please try again.",
          };
        }
      }
    }
    // Enterprise plan: unlimited invoices, no checks needed
  } catch (e) {
    // Return error object instead of throwing
    return {
      error: e instanceof Error ? e.message : "Plan validation failed.",
    };
  }

  const { data, error } = await supabase
    .from("Invoices")
    .insert({
      ...formData,
      author,
      public_token: uuidv4().replace(/-/g, ""), // Generate secure token for public access
    })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create an invoice");

  const invoice = data[0];

  try {
    await createActivity({
      user_id: author,
      business_id: formData.business_id, // assuming this exists in the invoice schema
      action: "Created invoice",
      target_type: "invoice",
      target_name: formData.invoice_number,
    });
  } catch (activityError) {
    console.error("Failed to create activity log:", activityError);
    // Don't fail the invoice creation if activity logging fails
  }

  return invoice;
};

//incorect, invoices must be selected by business id => clients id
export const getInvoicesByAuthor = async (): Promise<InvoiceListItem[]> => {
  const { userId: author } = await auth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select("*")
    .eq("author", author)
    .order("created_at", { ascending: false });

  if (error || !data)
    throw new Error(error?.message || "Failed to fetch invoices");

  return data as unknown as InvoiceListItem[];
};

export const getInvoicesList = async ({
  business_id,
  limit = 5,
  page = 1,
  searchTerm,
  filter,
}: BusinessDashboardPageProps & { filter?: string }) => {
  const supabase = await createClient();

  // Auto-mark overdue invoices
  const today = new Date().toISOString().split("T")[0];
  await supabase
    .from("Invoices")
    .update({ status: "overdue" })
    .eq("business_id", business_id)
    .neq("status", "paid")
    .neq("status", "draft")
    .neq("status", "overdue")
    .lt("due_date", today);

  // Select ALL the fields that are stored when creating an invoice
  let query = supabase
    .from("Invoices")
    .select(
      `
    id,
    business_id,
    invoice_number,
    total,
    status,
    due_date,
    created_at,
    issue_date,
    items,
    bill_to,
    company_details,
    notes,
    bank_details,
    subtotal,
    discount,
    shipping,
    description,
    currency,
    public_token,
    invoice_template,
    email_id,
    email_sent_at,
    email_delivered,
    email_delivered_at,
    email_opened,
    email_opened_at,
    email_open_count,
    email_clicked,
    email_clicked_at,
    email_click_count,
    email_bounced,
    email_bounced_at,
    email_complained,
    email_complained_at,
    meta_data
  `
    )
    .eq("business_id", business_id);

  // Add search filter
  if (searchTerm) {
    query = query.ilike("invoice_number", `%${searchTerm}%`);
  }

  // Add status filter
  if (filter && filter !== "") {
    query = query.eq("status", filter);
  }

  // Add pagination
  query = query.range((page - 1) * limit, page * limit - 1);

  // Order by created date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data: invoices, error } = await query;

  if (error) throw new Error(error.message);

  return invoices;
};
export const getInvoices = async (
  business_id: number,
  options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const { search = "", status = "all", page = 1, limit = 12 } = options;

  const supabase = await createClient();

  // Auto-mark overdue invoices
  // We check for invoices that are not paid/draft/overdue and have a due_date < today
  const today = new Date().toISOString().split("T")[0];
  await supabase
    .from("Invoices")
    .update({ status: "overdue" })
    .eq("business_id", business_id)
    .neq("status", "paid")
    .neq("status", "draft")
    .neq("status", "overdue")
    .lt("due_date", today);

  let query = supabase
    .from("Invoices")
    .select(
      `
      id,
      business_id,
      invoice_number,
      total,
      status,
      due_date,
      created_at,
      issue_date,
      items,
      bill_to,
      company_details,
      notes,
      bank_details,
      subtotal,
      discount,
      shipping,
      description,
      currency,
      public_token,
      invoice_template,
      email_id,
      email_sent_at,
      email_delivered,
      email_delivered_at,
      email_opened,
      email_opened_at,
      email_open_count,
      email_clicked,
      email_clicked_at,
      email_click_count,
      email_bounced,
      email_bounced_at,
      email_complained,
      email_complained_at
    `,
      { count: "exact" }
    )
    .eq("business_id", business_id);

  // Add search filter
  if (search) {
    query = query.ilike("invoice_number", `%${search}%`);
  }

  // Add status filter
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  // Add pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Order by created date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data: invoices, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    invoices: invoices || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

// Count invoices created by the current user in the current calendar month
export const getCurrentMonthInvoiceCountForUser = async () => {
  const { userId: author } = await auth();
  if (!author) return 0;
  const supabase = await createClient();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayISO = firstDay.toISOString();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthISO = nextMonth.toISOString();

  const { count, error } = await supabase
    .from("Invoices")
    .select("id", { count: "exact", head: true })
    .eq("author", author)
    .gte("created_at", firstDayISO)
    .lt("created_at", nextMonthISO);

  if (error) return 0;
  return count || 0;
};

// Count invoices for a specific business in the current month
export const getCurrentMonthInvoiceCountForBusiness = async (
  business_id: number
) => {
  const supabase = await createClient();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayISO = firstDay.toISOString();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthISO = nextMonth.toISOString();

  const { count, error } = await supabase
    .from("Invoices")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business_id)
    .gte("created_at", firstDayISO)
    .lt("created_at", nextMonthISO);

  if (error) return 0;
  return count || 0;
};

export const getNextInvoiceNumber = async (business_id: number) => {
  if (!business_id) {
    throw new Error("Business id is required to generate invoice numbers");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select("invoice_number")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Failed to fetch latest invoice number", error);
    throw new Error("Unable to determine next invoice number");
  }

  const latest = data && data.length ? data[0].invoice_number : undefined;
  const nextSequence = extractInvoiceSequence(latest) + 1;

  return formatInvoiceNumber(nextSequence || 1);
};

// Update only bank details, notes, and status (no plan limit impact)
export type InvoiceUpdatePayload = {
  status?: string;
  bank_details?: string;
  notes?: string;
  invoice_number?: string;
  description?: string;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  total?: number;
};

export const updateInvoiceBankDetailsAndNotes = async (
  invoiceId: number,
  updates: InvoiceUpdatePayload
) => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Verify ownership
  const { data: invoice, error: fetchError } = await supabase
    .from("Invoices")
    .select("author, invoice_number, business_id")
    .eq("id", invoiceId)
    .single();

  if (fetchError || !invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.author !== author) {
    throw new Error("Unauthorized: You don't own this invoice");
  }

  const plan = await getCurrentPlan();
  const freeFields = ["status", "bank_details", "notes"] as const;
  const proFields = [
    ...freeFields,
    "invoice_number",
    "description",
    "issue_date",
    "due_date",
    "currency",
    "subtotal",
    "discount",
    "shipping",
    "total",
  ] as const;

  const allowedFields = plan === "free_user" ? freeFields : proFields;

  const filteredUpdates: InvoiceUpdatePayload = {};
  let hasValidUpdate = false;

  for (const key of Object.keys(updates) as Array<keyof InvoiceUpdatePayload>) {
    const value = updates[key];
    if (value === undefined) continue;
    if (!allowedFields.includes(key as any)) {
      if (plan === "free_user") {
        throw new Error(
          "Free plan can only edit status, bank details, and notes."
        );
      }
      continue;
    }
    (filteredUpdates as any)[key] = value;
    hasValidUpdate = true;
  }

  if (!hasValidUpdate) {
    throw new Error("No editable fields provided.");
  }

  const { data, error } = await supabase
    .from("Invoices")
    .update(filteredUpdates)
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update invoice");
  }

  // Log activity
  await createActivity({
    user_id: author,
    business_id: invoice.business_id,
    action: "Updated invoice content",
    target_type: "invoice",
    target_name: invoice.invoice_number,
    metadata: updates.status ? { from: "", to: updates.status } : undefined,
  });

  return data;
};

// Get single invoice by ID
export const getInvoiceById = async (invoiceId: number) => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("author", author)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Invoice not found");
  }

  // Auto-mark overdue if needed
  const today = new Date().toISOString().split("T")[0];
  if (
    data.status !== "paid" &&
    data.status !== "draft" &&
    data.status !== "overdue" &&
    data.due_date &&
    data.due_date < today
  ) {
    await supabase
      .from("Invoices")
      .update({ status: "overdue" })
      .eq("id", invoiceId);
    data.status = "overdue";
  }

  return data;
};

export const deleteInvoiceAction = async (invoiceId: number) => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Verify ownership
  const { data: invoice, error: fetchError } = await supabase
    .from("Invoices")
    .select("id, invoice_number, business_id")
    .eq("id", invoiceId)
    .eq("author", author)
    .single();

  if (fetchError || !invoice) {
    return { error: "Invoice not found or access denied" };
  }

  const { error: deleteError } = await supabase
    .from("Invoices")
    .delete()
    .eq("id", invoiceId);

  if (deleteError) {
    return { error: deleteError.message || "Failed to delete invoice" };
  }

  // Log activity
  await createActivity({
    user_id: author,
    business_id: invoice.business_id,
    action: "Deleted invoice",
    target_type: "invoice",
    target_name: invoice.invoice_number,
  });

  revalidatePath("/dashboard");
  return { success: true };
};

export const getMonthlyRevenue = async (businessId: number) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  // Get invoices for the last 12 months
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setMonth(oneYearAgo.getMonth() + 1);
  oneYearAgo.setDate(1);

  const { data: invoices, error } = await supabase
    .from("Invoices")
    .select("issue_date, total, status")
    .eq("business_id", businessId)
    .gte("issue_date", oneYearAgo.toISOString());

  if (error) {
    console.error(
      "Error fetching monthly revenue:",
      JSON.stringify(error, null, 2)
    );
    return [];
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const today = new Date();
  const result = [];

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    result.push({ name: monthName, total: 0 });
  }

  const resultMap = new Map();
  result.forEach((item) => resultMap.set(item.name, item));

  invoices.forEach((inv) => {
    if (!inv.issue_date) return;

    // Case-insensitive check for paid status
    const status = (inv.status || "").toLowerCase();
    if (status !== "paid") return;

    const date = new Date(inv.issue_date);
    const monthName = months[date.getMonth()];

    const item = resultMap.get(monthName);
    if (item) {
      const amount =
        typeof inv.total === "number"
          ? inv.total
          : parseFloat(String(inv.total).replace(/[^0-9.-]+/g, "")) || 0;
      item.total += amount;
    }
  });

  return result;
};

/**
 * Get the last invoice's bank_details and notes for a specific client-business pair.
 * This helps pre-fill these fields when creating a new invoice for the same client.
 */
export const getLastInvoiceDefaults = async (
  clientId: number,
  businessId: number
): Promise<{ bank_details: string; notes: string } | null> => {
  const { userId: author } = await auth();
  if (!author) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select("bank_details, notes")
    .eq("business_id", businessId)
    .eq("author", author)
    .contains("bill_to", { id: clientId })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    bank_details: data.bank_details || "",
    notes: data.notes || "",
  };
};
