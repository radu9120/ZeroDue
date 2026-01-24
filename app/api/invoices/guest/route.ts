import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Use service role to create guest users and their data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface GuestInvoiceData {
  // Business info
  business_name: string;
  business_email: string;
  business_address: string;
  business_phone?: string;
  business_vat?: string;
  business_tax_label?: string;
  currency: string;
  // Client info
  client_name: string;
  client_email: string;
  client_address: string;
  client_phone?: string;
  // Invoice details
  invoice_number: string;
  issue_date: string;
  due_date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax?: number;
    amount: number;
  }>;
  subtotal: number;
  discount?: number;
  tax_rate?: number;
  total: number;
  notes?: string;
  // Guest email for account creation
  guest_email: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: GuestInvoiceData = await request.json();

    // Validate required fields
    if (!data.guest_email || !data.business_name || !data.client_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === data.guest_email,
    );

    let userId: string;
    let isNewUser = false;
    let tempPassword: string | undefined;

    if (existingUser) {
      // User exists - they need to sign in to claim this invoice
      userId = existingUser.id;
    } else {
      // Create new user with temporary password
      tempPassword = uuidv4().slice(0, 12);
      const { data: newUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email: data.guest_email,
          password: tempPassword,
          email_confirm: false, // Don't auto-confirm, send verification email
          user_metadata: {
            full_name: data.business_name,
            from_guest_invoice: true,
          },
        });

      if (createUserError || !newUser.user) {
        console.error("Failed to create user:", createUserError);
        return NextResponse.json(
          { error: "Failed to create account" },
          { status: 500 },
        );
      }

      userId = newUser.user.id;
      isNewUser = true;
    }

    // Create business for user
    const { data: business, error: businessError } = await supabaseAdmin
      .from("Businesses")
      .insert({
        name: data.business_name,
        email: data.business_email,
        address: data.business_address,
        phone: data.business_phone || null,
        vat: data.business_vat || null,
        tax_label: data.business_tax_label || "VAT",
        currency: data.currency.toUpperCase(),
        profile_type: "freelancer",
        author: userId,
      })
      .select()
      .single();

    if (businessError) {
      console.error("Failed to create business:", businessError);
      // If business already exists for this user, try to find it
      const { data: existingBusiness } = await supabaseAdmin
        .from("Businesses")
        .select("id")
        .eq("author", userId)
        .limit(1)
        .single();

      if (!existingBusiness) {
        return NextResponse.json(
          { error: "Failed to create business" },
          { status: 500 },
        );
      }
    }

    const businessId = business?.id || (await getExistingBusinessId(userId));

    // Create client
    const { data: client, error: clientError } = await supabaseAdmin
      .from("Clients")
      .insert({
        name: data.client_name,
        email: data.client_email,
        address: data.client_address,
        phone: data.client_phone || null,
        business_id: businessId,
      })
      .select()
      .single();

    if (clientError) {
      console.error("Failed to create client:", clientError);
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500 },
      );
    }

    const clientId = client?.id;

    // Don't generate public token - invoice is private to the user's account
    // They must verify email and sign in to access it

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("Invoices")
      .insert({
        invoice_number: data.invoice_number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax_rate: data.tax_rate || 0,
        total: data.total,
        notes: data.notes || "",
        status: "draft",
        author: userId,
        business_id: businessId,
        client_id: clientId,
        public_token: null,
        company_details: {
          name: data.business_name,
          email: data.business_email,
          address: data.business_address,
          phone: data.business_phone || "",
          vat: data.business_vat || "",
          tax_label: data.business_tax_label || "VAT",
          currency: data.currency,
          profile_type: "freelancer",
        },
        bill_to: {
          name: data.client_name,
          email: data.client_email,
          address: data.client_address,
          phone: data.client_phone || "",
        },
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Failed to create invoice:", invoiceError);
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 },
      );
    }

    // Send magic link to user so they can verify email and access their invoice
    // Both new and existing users need to sign in to access the invoice
    const { data: magicLinkData } = await supabaseAdmin.auth.admin.generateLink(
      {
        type: "magiclink",
        email: data.guest_email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zerodue.co"}/dashboard/invoices?new_invoice=${invoice.id}`,
        },
      },
    );

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      is_new_user: isNewUser,
      requires_verification: true,
      message: isNewUser
        ? "Account created! Check your email to verify and access your invoice."
        : "Invoice created! Check your email to sign in and access it.",
    });
  } catch (error) {
    console.error("Guest invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getExistingBusinessId(userId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from("Businesses")
    .select("id")
    .eq("author", userId)
    .limit(1)
    .single();
  return data?.id;
}
