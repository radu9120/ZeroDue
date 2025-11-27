"use server";
import { createClient } from "@/lib/supabase/server";
import { GetBusinessActivityProps, UserActivityLog } from "@/types";

export const createActivity = async (formData: UserActivityLog) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("UserActivityLog")
    .insert({ ...formData })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create an activity");

  return data[0];
};

export const getRecentBusinessActivity = async ({
  business_id,
  limit = 5,
}: GetBusinessActivityProps): Promise<UserActivityLog[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("UserActivityLog")
    .select("user_id, action, target_type, target_name, metadata, created_at")
    // .select("*, user:user_id(full_name)")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error?.message || "Failed to fetch an activity");

  return data ?? [];
};
