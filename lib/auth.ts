"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Auth helper that replaces Clerk's auth()
// Returns { userId } to match Clerk's API pattern
export async function auth() {
  const user = await getUser();
  return { userId: user?.id ?? null };
}

// Get current user details (replaces Clerk's currentUser())
export async function currentUser() {
  const user = await getUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.email_confirmed_at
      ? new Date(user.email_confirmed_at)
      : null,
    firstName: user.user_metadata?.full_name?.split(" ")[0] || null,
    lastName:
      user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
    imageUrl:
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    publicMetadata: user.user_metadata || {},
    createdAt: user.created_at ? new Date(user.created_at) : null,
  };
}

// Helper to require auth - redirects to sign-in if not authenticated
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

// Update user metadata (replaces clerkClient.users.updateUser)
export async function updateUserMetadata(metadata: Record<string, any>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}
