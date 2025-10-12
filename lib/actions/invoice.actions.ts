"use server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { CreateInvoice } from "@/schemas/invoiceSchema";
import { BusinessDashboardPageProps } from "@/types";
import { createActivity } from "./userActivity.actions";
import { redirect } from "next/navigation";

export const createInvoice = async (formData: CreateInvoice) => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Invoices")
    .insert({ ...formData, author })
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
    currency
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
      currency
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
