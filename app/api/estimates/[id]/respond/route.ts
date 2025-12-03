import { createSupabaseAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { accepted, client_notes, public_token } = body;

    const supabaseAdmin = createSupabaseAdminClient();

    // Verify the estimate exists and token matches
    const { data: estimate, error: fetchError } = await supabaseAdmin
      .from("Estimates")
      .select("id, status, public_token")
      .eq("id", parseInt(id))
      .single();

    if (fetchError || !estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Verify token
    if (estimate.public_token !== public_token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // Check if already responded
    if (["accepted", "rejected", "converted"].includes(estimate.status)) {
      return NextResponse.json(
        { error: "Estimate has already been responded to" },
        { status: 400 }
      );
    }

    // Update estimate status
    const { error: updateError } = await supabaseAdmin
      .from("Estimates")
      .update({
        status: accepted ? "accepted" : "rejected",
        client_notes: client_notes || null,
        client_response_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parseInt(id));

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update estimate" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: accepted ? "accepted" : "rejected",
    });
  } catch (error) {
    console.error("Error responding to estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
