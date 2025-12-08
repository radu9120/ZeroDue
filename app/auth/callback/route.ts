import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/emails";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log(
    "[Auth Callback] code:",
    code ? "present" : "missing",
    "next:",
    next
  );

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    console.log(
      "[Auth Callback] exchangeCodeForSession result:",
      error ? `ERROR: ${error.message}` : "SUCCESS"
    );

    if (!error) {
      // Check if this is a new user (first login) and send welcome email
      const user = data?.user;
      if (user?.email) {
        // Check if welcome email was already sent
        const welcomeEmailSent = user.user_metadata?.welcome_email_sent;

        if (!welcomeEmailSent) {
          try {
            await sendWelcomeEmail(user.email, user.user_metadata?.full_name);
            // Mark welcome email as sent
            await supabase.auth.updateUser({
              data: { welcome_email_sent: true },
            });
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
