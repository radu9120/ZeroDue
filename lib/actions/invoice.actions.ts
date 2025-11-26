"use server";
import { auth } from "@/lib/auth";
import { createSupabaseClient } from "@/lib/supabase";
import { CreateInvoice } from "@/schemas/invoiceSchema";
import { BusinessDashboardPageProps } from "@/types";
import { createActivity } from "./userActivity.actions";
import { redirect } from "next/navigation";
import { type AppPlan } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/plan";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { getBusinessById } from "./business.actions";
import { createSupabaseAdminClient } from "@/lib/supabase";

// Lazy initialize Resend to avoid build-time errors when env var is not set
let resend: Resend | null = null;
function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

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
        "error:",
        countError
      );

      const totalInvoices = count || 0;
      const freeLimit = 2;

      if (totalInvoices >= freeLimit && extraCredits <= 0) {
        console.log(
          "[createInvoice] Limit reached - totalInvoices:",
          totalInvoices,
          "freeLimit:",
          freeLimit,
          "extraCredits:",
          extraCredits
        );
        return {
          error:
            "NEEDS_PAYMENT:You've used your 2 free invoices. Purchase additional invoice credits ($0.99 each) to continue.",
        };
      }

      // If using extra credits, decrement
      if (totalInvoices >= freeLimit && extraCredits > 0) {
        await supabase
          .from("Businesses")
          .update({ extra_invoice_credits: extraCredits - 1 })
          .eq("id", businessId);
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

      // If using extra credits, decrement
      if (monthlyCount >= monthlyLimit && extraCredits > 0) {
        await supabase
          .from("Businesses")
          .update({ extra_invoice_credits: extraCredits - 1 })
          .eq("id", businessId);
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

export const getInvoicesList = async ({
  business_id,
  limit = 5,
  page = 1,
  searchTerm,
  filter,
}: BusinessDashboardPageProps & { filter?: string }) => {
  const supabase = createSupabaseClient();

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

  const supabase = createSupabaseClient();

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

  const supabase = createSupabaseClient();

  // Verify ownership
  const { data: invoice, error: fetchError } = await supabase
    .from("Invoices")
    .select("id, invoice_number, business_id")
    .eq("id", invoiceId)
    .eq("author", author)
    .single();

  if (fetchError || !invoice) {
    throw new Error("Invoice not found or access denied");
  }

  const { error: deleteError } = await supabase
    .from("Invoices")
    .delete()
    .eq("id", invoiceId);

  if (deleteError) {
    throw new Error(deleteError.message || "Failed to delete invoice");
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

export const sendInvoiceEmailAction = async (
  invoiceId: number,
  businessId: number
) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabaseAdmin = createSupabaseAdminClient();

  // Load invoice by id (admin client) and verify ownership
  const { data: invoice, error: invErr } = await supabaseAdmin
    .from("Invoices")
    .select(
      "id, author, invoice_number, bill_to, description, issue_date, due_date, total, currency, notes, bank_details, public_token, email_id"
    )
    .eq("id", invoiceId)
    .single();

  if (invErr || !invoice) {
    throw new Error("Invoice not found");
  }
  if (invoice.author !== userId) {
    throw new Error("Forbidden");
  }

  // Generate public token if it doesn't exist
  let publicToken = invoice.public_token;
  if (!publicToken) {
    publicToken = crypto.randomUUID().replace(/-/g, "");
    await supabaseAdmin
      .from("Invoices")
      .update({ public_token: publicToken })
      .eq("id", invoice.id);
  }

  // Fetch business details
  const business = await getBusinessById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  // Parse client details
  let clientEmail = "";
  let clientName = "";

  if (invoice.bill_to) {
    if (typeof invoice.bill_to === "string") {
      try {
        const parsed = JSON.parse(invoice.bill_to);
        clientEmail = parsed.email || "";
        clientName = parsed.name || "";
      } catch {
        // Handle legacy format if needed
      }
    } else if (typeof invoice.bill_to === "object") {
      clientEmail = (invoice.bill_to as any).email || "";
      clientName = (invoice.bill_to as any).name || "";
    }
  }

  if (!clientEmail) {
    throw new Error("Client email not found");
  }

  // Calculate total
  const total = Number(invoice.total || 0).toFixed(2);
  const currency = (invoice as any).currency || "GBP";
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";

  // Create public invoice URL
  const invoiceUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/invoice/${publicToken}`;

  // Send email via Resend
  const { data: emailData, error: emailError } =
    await getResendClient().emails.send({
      from: "InvoiceFlow <noreply@invoiceflow.net>",
      to: [clientEmail],
      subject: `Invoice #${invoice.invoice_number} from ${business.name}`,
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Invoice from ${business.name}</h2>
        <p>Hi ${clientName},</p>
        <p>Please find attached invoice #${invoice.invoice_number} for ${currencySymbol}${total}.</p>
        <p><strong>Due Date:</strong> ${new Date(
          invoice.due_date
        ).toLocaleDateString()}</p>
        <div style="margin: 30px 0;">
          <a href="${invoiceUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View & Pay Invoice</a>
        </div>
        <p>Or copy this link: <a href="${invoiceUrl}">${invoiceUrl}</a></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">Powered by InvoiceFlow</p>
      </div>
    `,
      tags: [
        { name: "category", value: "invoice" },
        { name: "invoice_id", value: invoice.id.toString() },
      ],
    });

  if (emailError) {
    console.error("Resend Error:", emailError);
    throw new Error("Failed to send email via provider");
  }

  // Update invoice status
  const { data: updatedInvoice, error: updateError } = await supabaseAdmin
    .from("Invoices")
    .update({
      status: "sent",
      email_id: emailData?.id || null,
      email_sent_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .select()
    .single();

  if (updateError) {
    throw new Error("Email sent but failed to update invoice status");
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Invoice sent successfully!",
    updatedStatus: "sent",
    emailId: emailData?.id,
  };
};

export const getMonthlyRevenue = async (businessId: number) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseClient();

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
