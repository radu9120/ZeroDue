"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CloneTemplateParams {
  templateId: number;
  clientId: string;
  dueDate: string;
}

export async function cloneTemplateToInvoice({
  templateId,
  clientId,
  dueDate,
}: CloneTemplateParams) {
  const supabase = await createClient();

  try {
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from("invoice_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return { error: "Template not found" };
    }

    // Get the latest invoice number for this user
    const { data: latestInvoice } = await supabase
      .from("invoices")
      .select("number")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Generate next invoice number
    let nextNumber = "INV-001";
    if (latestInvoice?.number) {
      const currentNum = parseInt(latestInvoice.number.split("-")[1]);
      nextNumber = `INV-${String(currentNum + 1).padStart(3, "0")}`;
    }

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return { error: "Client not found" };
    }

    // Create the invoice from template
    const { data: newInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        number: nextNumber,
        client_id: clientId,
        bill_to: {
          name: client.name,
          email: client.email,
          address: client.address || "",
          city: client.city || "",
          postal_code: client.postal_code || "",
          country: client.country || "United Kingdom",
        },
        items: template.items,
        subtotal: template.subtotal,
        tax: template.tax,
        total: template.total,
        notes: template.notes || "",
        currency: template.currency || "GBP",
        status: "draft",
        date: new Date().toISOString().split("T")[0],
        due_date: dueDate,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return { error: "Failed to create invoice from template" };
    }

    revalidatePath("/dashboard/invoices");
    return { success: true, invoice: newInvoice };
  } catch (error) {
    console.error("Error cloning template:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function getTemplatesByIndustry(industry: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("invoice_templates")
      .select("*")
      .eq("industry", industry)
      .order("template_name", { ascending: true });

    if (error) throw error;

    return { templates: data };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { templates: [], error: "Failed to fetch templates" };
  }
}
