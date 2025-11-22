"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { CreateInvoice } from "@/schemas/invoiceSchema";
import { BusinessDashboardPageProps } from "@/types";
import { createActivity } from "./userActivity.actions";
import { redirect } from "next/navigation";
import { type AppPlan } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/plan";

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

  const supabase = createSupabaseClient();

  // Enforce plan limits before insert
  try {
    const plan: AppPlan = await getCurrentPlan();
    if (plan === "free_user") {
      // Free plan: 2 invoices per month
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
        .gte("created_at", firstDayISO)
        .lt("created_at", nextMonthISO);
      if ((count || 0) >= 2) {
        throw new Error(
          "Free plan limit: 2 invoices per month. Upgrade to create more."
        );
      }
    } else if (plan === "professional") {
      // Professional plan: 15 invoices per month
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
        .gte("created_at", firstDayISO)
        .lt("created_at", nextMonthISO);
      if ((count || 0) >= 15) {
        throw new Error(
          "Professional plan limit: 15 invoices per month. Upgrade to Enterprise for unlimited."
        );
      }
    }
  } catch (e) {
    // rethrow to surface a clean message to the UI
    throw e instanceof Error ? e : new Error("Plan validation failed.");
  }

  const { data, error } = await supabase
    .from("Invoices")
    .insert({
      ...formData,
      author,
      public_token: crypto.randomUUID().replace(/-/g, ""), // Generate secure token for public access
    })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create an invoice");

  const invoice = data[0];

  await createActivity({
    user_id: author,
    business_id: formData.business_id, // assuming this exists in the invoice schema
    action: "Created invoice",
    target_type: "invoice",
    target_name: formData.invoice_number,
  });

  return invoice;
};

//incorect, invoices must be selected by business id => clients id
export const getInvoicesByAuthor = async () => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select("*")
    .eq("author", author)
    .order("created_at", { ascending: false });

  if (error || !data)
    throw new Error(error?.message || "Failed to fetch invoices");

  return data;
};

// ...existing code...

export const getInvoicesList = async ({
  business_id,
  limit = 5,
  page = 1,
  searchTerm,
  filter,
}: BusinessDashboardPageProps & { filter?: string }) => {
  const supabase = createSupabaseClient();

  // Select ALL the fields that are stored when creating an invoice
  let query = supabase
    .from("Invoices")
    .select(
      `
    id,
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

  const supabase = createSupabaseClient();

  let query = supabase
    .from("Invoices")
    .select(
      `
      id,
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
  const supabase = createSupabaseClient();

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
  const supabase = createSupabaseClient();

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

  const supabase = createSupabaseClient();

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

  const supabase = createSupabaseClient();

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

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("author", author)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Invoice not found");
  }

  return data;
};
