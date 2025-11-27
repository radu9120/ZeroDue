import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (rawUrl) {
    rawUrl = rawUrl.trim().replace(/\/$/, ""); // trim whitespace + trailing slash
  }

  const url = rawUrl;

  if (!url || !anon) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!anon) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    throw new Error(
      `Missing environment variable(s): ${missing.join(", ")}.\n` +
        `Create a .env.local file at the project root and set these values.\n` +
        `See .env.example for the list of required variables.`
    );
  }

  // Basic shape validation to catch typos early
  if (!/^https:\/\/[^\s]+\.supabase\.co$/.test(url)) {
    console.warn(
      "[supabase:init] URL does not match expected pattern '<ref>.supabase.co':",
      url
    );
  }

  return createClient(url, anon);
};

// Server-only admin client using service role key for operations requiring bypass of RLS
export const createSupabaseAdminClient = () => {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try both variable names - prefer the non-public one for security
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (rawUrl) {
    rawUrl = rawUrl.trim().replace(/\/$/, "");
  }

  const url = rawUrl;
  if (!url || !serviceKey) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(
      `Missing environment variable(s) for admin client: ${missing.join(", ")}.`
    );
  }

  return createClient(url, serviceKey);
};
