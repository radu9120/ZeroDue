import { NextResponse } from "next/server";

export async function GET() {
  const hasClerkPub = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY);
  const hasWebhookSecret = Boolean(process.env.CLERK_WEBHOOK_SECRET);
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: hasClerkPub,
      CLERK_SECRET_KEY: hasClerkSecret,
      CLERK_WEBHOOK_SECRET: hasWebhookSecret,
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasSupabaseAnon,
    },
    routes: {
      webhook: "/api/clerk/webhooks",
    },
  });
}
