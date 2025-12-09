import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This is a dev-only endpoint to test Supabase email sending
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      {
        error:
          "Missing email parameter. Usage: /api/dev/test-email?email=your@email.com",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // This will trigger Supabase to send a password reset email
    // which uses your configured SMTP settings
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${email}. Check your inbox (and spam folder) to verify SMTP is working.`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
