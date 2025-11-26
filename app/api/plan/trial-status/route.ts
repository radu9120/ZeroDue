import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ 
        hasUsedTrial: false,
        isAuthenticated: false 
      });
    }

    const hasUsedTrial = user.user_metadata?.has_used_trial === true;

    return NextResponse.json({
      hasUsedTrial,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error checking trial status:", error);
    return NextResponse.json({ 
      hasUsedTrial: false,
      isAuthenticated: false 
    });
  }
}
