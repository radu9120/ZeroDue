"use server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createActivity } from "./userActivity.actions";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import type { Estimate } from "@/types";

export interface CreateEstimateInput {
  business_id: number;
  client_id: number;
  description?: string;
  items: any[];
  notes?: string;
  currency: string;
  discount?: number;
  shipping?: number;
  valid_until?: string;
  estimate_template?: string;
}

export async function createEstimate(input: CreateEstimateInput) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Generate estimate number
  const { data: lastEstimate } = await supabase
    .from("Estimates")
    .select("estimate_number")
    .eq("business_id", input.business_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const lastNum = lastEstimate?.estimate_number?.match(/(\d+)$/)?.[1] || "0";
  const nextNum = String(parseInt(lastNum) + 1).padStart(4, "0");
  const estimateNumber = `EST${nextNum}`;

  // Calculate totals
  const items = input.items || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const tax = Number(item.tax || 0);
    return sum + qty * price * (1 + tax / 100);
  }, 0);

  const discountAmount = subtotal * ((input.discount || 0) / 100);
  const total = subtotal - discountAmount + (input.shipping || 0);

  const { data, error } = await supabase
    .from("Estimates")
    .insert({
      ...input,
      author,
      estimate_number: estimateNumber,
      subtotal,
      total,
      issue_date: new Date().toISOString().split("T")[0],
      status: "draft",
      public_token: uuidv4().replace(/-/g, ""),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await createActivity({
    user_id: author,
    business_id: input.business_id,
    action: "Created estimate",
    target_type: "estimate",
    target_name: estimateNumber,
  });

  revalidatePath("/dashboard/estimates");
  return data as Estimate;
}

export async function getEstimates(business_id: number, status?: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  let query = supabase
    .from("Estimates")
    .select(
      `
      *,
      client:Clients(id, name, email)
    `
    )
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data as Estimate[];
}

export async function getEstimate(id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Estimates")
    .select(
      `
      *,
      client:Clients(*),
      business:Businesses(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Estimate;
}

export async function getEstimateByToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Estimates")
    .select(
      `
      *,
      client:Clients(*),
      business:Businesses(*)
    `
    )
    .eq("public_token", token)
    .single();

  if (error) return null;

  // Mark as viewed if sent
  if (data.status === "sent") {
    await supabase
      .from("Estimates")
      .update({ status: "viewed" })
      .eq("id", data.id);
  }

  return data as Estimate;
}

export async function updateEstimate(
  id: number,
  updates: Partial<CreateEstimateInput> & { status?: string }
) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Recalculate totals if items changed
  let calculatedUpdates: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.items) {
    const items = updates.items;
    const subtotal = items.reduce((sum: number, item: any) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unit_price || 0);
      const tax = Number(item.tax || 0);
      return sum + qty * price * (1 + tax / 100);
    }, 0);

    const discountAmount = subtotal * ((updates.discount || 0) / 100);
    const total = subtotal - discountAmount + (updates.shipping || 0);

    calculatedUpdates.subtotal = subtotal;
    calculatedUpdates.total = total;
  }

  const { data, error } = await supabase
    .from("Estimates")
    .update(calculatedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/estimates");
  return data as Estimate;
}

export async function sendEstimate(id: number) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Estimates")
    .update({
      status: "sent",
      email_sent_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`*, client:Clients(*)`)
    .single();

  if (error) throw new Error(error.message);

  // TODO: Actually send email via Resend

  await createActivity({
    user_id: author,
    business_id: data.business_id,
    action: "Sent estimate",
    target_type: "estimate",
    target_name: data.estimate_number,
  });

  revalidatePath("/dashboard/estimates");
  return data as Estimate;
}

export async function acceptEstimate(token: string, clientNotes?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Estimates")
    .update({
      status: "accepted",
      client_response_at: new Date().toISOString(),
      client_notes: clientNotes,
    })
    .eq("public_token", token)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Log activity (no auth needed for public action)
  await supabase.from("UserActivityLog").insert({
    user_id: data.author,
    business_id: data.business_id,
    action: "Estimate accepted",
    target_type: "estimate",
    target_name: data.estimate_number,
  });

  return data as Estimate;
}

export async function rejectEstimate(token: string, clientNotes?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Estimates")
    .update({
      status: "rejected",
      client_response_at: new Date().toISOString(),
      client_notes: clientNotes,
    })
    .eq("public_token", token)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Estimate;
}

export async function convertEstimateToInvoice(estimateId: number) {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = await createClient();

  // Get the estimate
  const { data: estimate, error: fetchError } = await supabase
    .from("Estimates")
    .select("*, client:Clients(*), business:Businesses(*)")
    .eq("id", estimateId)
    .single();

  if (fetchError || !estimate) throw new Error("Estimate not found");

  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from("Invoices")
    .select("invoice_number")
    .eq("business_id", estimate.business_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const lastNum = lastInvoice?.invoice_number?.match(/(\d+)$/)?.[1] || "0";
  const nextNum = String(parseInt(lastNum) + 1).padStart(4, "0");
  const invoiceNumber = `INV${nextNum}`;

  // Create the invoice
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const { data: invoice, error: createError } = await supabase
    .from("Invoices")
    .insert({
      business_id: estimate.business_id,
      client_id: estimate.client_id,
      author,
      invoice_number: invoiceNumber,
      description: estimate.description,
      items: estimate.items,
      notes: estimate.notes,
      currency: estimate.currency,
      subtotal: estimate.subtotal,
      discount: estimate.discount,
      shipping: estimate.shipping,
      total: estimate.total,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      status: "draft",
      invoice_template: estimate.estimate_template,
      company_details: {
        name: estimate.business?.name,
        email: estimate.business?.email,
        address: estimate.business?.address,
        phone: estimate.business?.phone,
        vat: estimate.business?.vat,
      },
      bill_to: {
        id: estimate.client?.id,
        name: estimate.client?.name,
        email: estimate.client?.email,
        address: estimate.client?.address,
        phone: estimate.client?.phone,
      },
    })
    .select()
    .single();

  if (createError) throw new Error(createError.message);

  // Update estimate
  await supabase
    .from("Estimates")
    .update({
      status: "converted",
      converted_to_invoice_id: invoice.id,
      converted_at: new Date().toISOString(),
    })
    .eq("id", estimateId);

  await createActivity({
    user_id: author,
    business_id: estimate.business_id,
    action: "Converted estimate to invoice",
    target_type: "invoice",
    target_name: invoiceNumber,
    metadata: { from: estimate.estimate_number, to: invoiceNumber },
  });

  revalidatePath("/dashboard/estimates");
  revalidatePath("/dashboard/invoices");
  return invoice;
}

export async function deleteEstimate(id: number) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { error } = await supabase.from("Estimates").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/estimates");
  return { success: true };
}
