import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry");

  const supabase = await createClient();

  try {
    let query = supabase
      .from("invoice_templates")
      .select("*")
      .order("template_name", { ascending: true });

    if (industry) {
      query = query.eq("industry", industry);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ templates: data });
  } catch (error) {
    console.error("Error fetching invoice templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
