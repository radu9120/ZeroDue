"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createSupabaseClient,
  createSupabaseAdminClient,
} from "@/lib/supabase";
import { CreateBusiness } from "@/schemas/invoiceSchema";
import { redirect } from "next/navigation";
import {
  BusinessDashboardPageProps,
  BusinessType,
  DashboardBusinessStats,
} from "@/types";
import { createActivity } from "./userActivity.actions";
import { type AppPlan } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/plan";
import { revalidatePath } from "next/cache";
import { deleteFileFromBucket } from "./logo.action";

// Simple module-level timestamp to throttle repeated network error logs for dashboard
let lastDashboardNetworkLog: number | null = null;

export type CreateBusinessResult =
  | { ok: true; business: BusinessType }
  | { ok: false; error: string; transient?: boolean; details?: any };

export type DeleteBusinessResult = { ok: true } | { ok: false; error: string };

export const createBusiness = async (
  formData: CreateBusiness
): Promise<CreateBusinessResult> => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = createSupabaseClient();
  // Enforce plan limits before creating a business
  try {
    const plan: AppPlan = await getCurrentPlan();
    // Count existing businesses for this author
    const { count: bizCount } = await supabase
      .from("Businesses")
      .select("id", { count: "exact", head: true })
      .eq("author", author);
    const limit =
      plan === "free_user" ? 1 : plan === "professional" ? 3 : Infinity;
    if ((bizCount || 0) >= limit) {
      const msg =
        plan === "free_user"
          ? "Free plan limit reached: 1 business max. Contact support for upgrade options."
          : plan === "professional"
            ? "Professional plan limit reached: 3 businesses max. Contact support for assistance."
            : "Business limit reached. Contact support for assistance.";
      return { ok: false, error: msg };
    }
  } catch (_) {
    // If anything fails here, continue; better to allow than block due to a transient error
  }
  // Retry the insert a couple of times in case of transient network errors
  let attemptError: any = null;
  let created: any = null;
  for (let i = 0; i < 2; i++) {
    try {
      const { data, error } = await supabase
        .from("Businesses")
        .insert({ ...formData, author })
        .select()
        .single();
      if (error) {
        attemptError = error;
        const msg = String(error?.message || error);
        const transient =
          /fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT/i.test(msg);
        if (i === 1 || !transient) break; // don't retry non-transient
      } else {
        created = data;
        attemptError = null;
        break; // success
      }
    } catch (err: any) {
      attemptError = err;
      const msg = String(err?.message || err);
      const transient =
        /fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT/i.test(msg);
      if (i === 1 || !transient) break;
    }
    // small backoff before retry
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!created) {
    const message = String(
      attemptError?.message || attemptError || "Failed to create business"
    );
    const transient =
      /fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT/i.test(message);
    // If transient network error, attempt a direct REST fallback insert before giving up
    if (transient) {
      try {
        const restUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Businesses`;
        const payload = { ...formData, author };
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(restUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            created = data[0];
          } else {
            // empty representation
          }
        } else {
          // ignore non-OK
        }
      } catch (restErr: any) {
        // ignore
      }
    }
    if (created) {
      // Successful via fallback path
      try {
        await createActivity({
          user_id: author!,
          business_id: created.id,
          action: "Created Business instance",
          target_type: "business",
          target_name: formData.name,
        });
      } catch (_) {}
      return { ok: true, business: created as BusinessType };
    }
    // Log server-side
    try {
      console.error(
        "Supabase insert Businesses failed",
        JSON.stringify(
          {
            message,
            status: attemptError?.status,
            details: attemptError?.details,
            hint: attemptError?.hint,
            transient,
            supabaseEnv: transient
              ? {
                  url_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                  url_host: (() => {
                    try {
                      return process.env.NEXT_PUBLIC_SUPABASE_URL
                        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
                        : null;
                    } catch (_) {
                      return "invalid-url";
                    }
                  })(),
                  anon_key_len: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length
                    : 0,
                  anon_key_suffix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-6)
                    : null,
                }
              : undefined,
          },
          null,
          2
        )
      );
    } catch (_) {}
    return { ok: false, error: message, transient, details: attemptError };
  }

  // Best-effort activity log; don't fail the main operation if logging fails
  try {
    await createActivity({
      user_id: author,
      business_id: created.id, // assuming this exists in the invoice schema
      action: "Created Business instance",
      target_type: "business",
      target_name: formData.name,
    });
  } catch (logErr: any) {
    try {
      console.warn(
        "createActivity failed after business creation",
        JSON.stringify({ message: String(logErr?.message || logErr) })
      );
    } catch (_) {}
  }

  return { ok: true, business: created as BusinessType };
};

export const getUserBusinesses = async () => {
  const { userId: author } = await auth();

  if (!author) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Businesses")
    .select("*")
    .eq("author", author)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch businesses");
  }

  return data || [];
};

export const getBusinessById = async (businessId: number) => {
  const { userId: author } = await auth();

  if (!author) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error) {
    throw new Error(error.message || "Failed to fetch business");
  }

  return data as BusinessType;
};

export const updateBusiness = async (
  businessId: number,
  formData: Partial<CreateBusiness>
) => {
  console.log(
    `Server: updateBusiness called for ID ${businessId} with formData:`,
    formData
  ); // ADD THIS LOG
  const { userId: author } = await auth();

  if (!author) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Businesses")
    .update(formData)
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    console.error("Supabase error updating business:", error.message);
    throw new Error(error.message || "Failed to update business.");
  }

  if (!data) {
    // This could happen if the businessId or author didn't match an existing record
    console.warn(`No business found or updated for ID: ${businessId}.`);
    throw new Error("Business not found or user not authorized to update it.");
  }

  const updatedBusiness: BusinessType = data;

  await createActivity({
    user_id: author,
    business_id: updatedBusiness.id,
    action: "Updated business details",
    target_type: "business",
    // Use the potentially new name from formData, or fallback to existing if not updated
    target_name: formData.name || updatedBusiness.name,
  });

  return data;
};

export const deleteBusiness = async (
  businessId: number
): Promise<DeleteBusinessResult> => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const numericId = Number(businessId);
  if (!numericId || Number.isNaN(numericId) || numericId <= 0) {
    return { ok: false, error: "Invalid business identifier." };
  }

  const supabase = createSupabaseClient();

  try {
    const { data: businessRecord, error: fetchError } = await supabase
      .from("Businesses")
      .select("id, author, logo, name")
      .eq("id", numericId)
      .single();

    if (fetchError || !businessRecord) {
      return { ok: false, error: "Business not found." };
    }

    if (businessRecord.author !== userId) {
      return {
        ok: false,
        error: "You are not allowed to delete this business.",
      };
    }

    const adminSupabase = createSupabaseAdminClient();

    const relatedCleanupTargets: Array<{
      table: string;
      column: string;
    }> = [
      { table: "Invoices", column: "business_id" },
      { table: "Clients", column: "business_id" },
      { table: "UserActivityLog", column: "business_id" },
    ];

    for (const target of relatedCleanupTargets) {
      const { error: cleanupError } = await adminSupabase
        .from(target.table)
        .delete()
        .eq(target.column, numericId);
      if (cleanupError) {
        throw new Error(
          cleanupError.message ||
            `Failed to remove related records from ${target.table}.`
        );
      }
    }

    const { error: deleteError } = await adminSupabase
      .from("Businesses")
      .delete()
      .eq("id", numericId)
      .eq("author", userId);

    if (deleteError) {
      throw new Error(deleteError.message || "Failed to delete business.");
    }

    const logoUrl =
      typeof businessRecord.logo === "string" && businessRecord.logo.trim()
        ? businessRecord.logo
        : null;

    if (logoUrl) {
      try {
        await deleteFileFromBucket(logoUrl);
      } catch (logoError) {
        console.warn(
          "Failed to remove business logo from storage",
          JSON.stringify(
            {
              business_id: numericId,
              message: String(
                logoError instanceof Error ? logoError.message : logoError
              ),
            },
            null,
            2
          )
        );
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/business");
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/invoices");

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete business. Please try again.";
    try {
      console.error(
        "deleteBusiness failed",
        JSON.stringify(
          {
            businessId: numericId,
            message,
          },
          null,
          2
        )
      );
    } catch (_) {}
    return { ok: false, error: message };
  }
};

export const getBusiness = async ({
  business_id,
}: BusinessDashboardPageProps): Promise<Pick<
  BusinessType,
  "id" | "name" | "email" | "currency"
> | null> => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = createSupabaseClient();

  const { data: business, error } = await supabase
    .from("Businesses")
    .select("id, name, email, currency")
    .eq("id", business_id)
    .eq("author", author)
    .limit(1)
    .maybeSingle<Pick<BusinessType, "id" | "name" | "email" | "currency">>();

  if (error) throw new Error(error.message);

  return business;
};

export const getBusinessStats = async ({
  business_id,
}: BusinessDashboardPageProps) => {
  const supabase = createSupabaseClient();

  try {
    const { data: businessStats, error } = await supabase.rpc(
      "get_business_stats",
      { p_business_id: business_id }
    );
    if (error) throw error;
    return businessStats ? businessStats[0] : null;
  } catch (e: any) {
    // Useful server-side context
    console.error("Supabase RPC get_business_stats failed", {
      business_id,
      message: e?.message,
      status: e?.status,
      details: e?.details,
      hint: e?.hint,
    });
    throw new Error(e?.message || "Failed to fetch business stats");
  }
};

export const getDashboardStats = async (): Promise<
  DashboardBusinessStats[]
> => {
  const { userId: author } = await auth();
  if (!author) redirect("/sign-in");

  const supabase = createSupabaseClient();

  // If flag set, bypass RPC entirely and aggregate directly.
  if (process.env.SUPABASE_DISABLE_DASHBOARD_RPC === "1") {
    try {
      // Fetch user's businesses first
      const { data: businesses, error: bizErr } = await supabase
        .from("Businesses")
        .select("id, name, created_at")
        .eq("author", author)
        .order("created_at", { ascending: false });
      if (bizErr) throw bizErr;
      const list = businesses || [];

      // For each business, get counts (parallel but modest: Promise.all)
      const stats = await Promise.all(
        list.map(async (b: any) => {
          // Count invoices
          const [invoicesRes, clientsRes] = await Promise.all([
            supabase
              .from("Invoices")
              .select("id", { count: "exact", head: true })
              .eq("business_id", b.id),
            supabase
              .from("Clients")
              .select("id", { count: "exact", head: true })
              .eq("business_id", b.id),
          ]);

          const invoiceCount = invoicesRes?.count || 0;
          const clientCount = clientsRes?.count || 0;

          // Revenue sum (simple query; if performance becomes issue, add RPC later)
          let totalRevenue = 0;
          try {
            const { data: revRows, error: revErr } = await supabase
              .from("Invoices")
              .select("total")
              .eq("business_id", b.id)
              .eq("status", "paid");
            if (!revErr && revRows) {
              totalRevenue = revRows.reduce((acc: number, r: any) => {
                const num =
                  typeof r.total === "number" ? r.total : parseFloat(r.total);
                return acc + (isNaN(num) ? 0 : num);
              }, 0);
            }
          } catch (_) {}

          return {
            id: b.id,
            name: b.name,
            totalinvoices: invoiceCount,
            totalrevenue: totalRevenue,
            totalclients: clientCount,
            created_on: b.created_at,
          } as DashboardBusinessStats;
        })
      );

      console.info(
        "[dashboard] RPC bypass active (SUPABASE_DISABLE_DASHBOARD_RPC=1)",
        JSON.stringify({ businesses: list.length }, null, 2)
      );
      return stats;
    } catch (bypassErr: any) {
      console.error(
        "[dashboard] Bypass aggregation failed",
        JSON.stringify(
          { message: String(bypassErr?.message || bypassErr) },
          null,
          2
        )
      );
      // Fall through to normal path (will attempt RPC and existing logic)
    }
  }
  try {
    // Inline retry (2 attempts) for transient network failures
    let rpcData: any = null;
    let rpcError: any = null;
    for (let i = 0; i < 2; i++) {
      try {
        const { data, error } = await supabase.rpc("get_all_dashboard_stats", {
          p_author_id: author,
        });
        rpcData = data;
        rpcError = error;
        break; // success path (even if error is non-network, we'll handle below)
      } catch (err: any) {
        const msg = String(err?.message || err);
        const transient =
          /fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT/i.test(msg);
        if (i === 1 || !transient) throw err;
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    if (rpcError) throw rpcError;
    return rpcData ?? [];
  } catch (e: any) {
    const message = String(e?.message || e);
    const isNetwork =
      /fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT/i.test(message);

    // Attempt IPv4 fallback for RPC if network classified
    if (isNetwork && process.env.SUPABASE_RPC_IPV4_FALLBACK !== "0") {
      try {
        const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").host;
        // dynamic import dns to avoid issues in edge runtimes if any
        const dns = await import("node:dns/promises");
        const aRecords = await dns
          .lookup(host, { all: true, family: 4 })
          .catch(() => []);
        if (aRecords.length) {
          const ip = aRecords[0].address;
          const fetchUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_all_dashboard_stats`;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5000);
          const body = JSON.stringify({ p_author_id: author });
          const res = await fetch(fetchUrl.replace(host, ip), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              Host: host, // preserve original host for SNI/HTTP routing
              Prefer: "return=representation",
            },
            body,
            signal: controller.signal,
          });
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            console.info(
              "[dashboard] IPv4 RPC fallback succeeded",
              JSON.stringify(
                { ip, rows: Array.isArray(data) ? data.length : null },
                null,
                2
              )
            );
            return data ?? [];
          } else {
            const txt = await res.text();
            console.warn(
              "[dashboard] IPv4 RPC fallback HTTP failure",
              JSON.stringify(
                { status: res.status, ip, body: txt.slice(0, 300) },
                null,
                2
              )
            );
          }
        } else {
          console.warn("[dashboard] IPv4 fallback: no A records found", host);
        }
      } catch (ipv4Err: any) {
        console.warn(
          "[dashboard] IPv4 fallback error",
          JSON.stringify(
            { message: String(ipv4Err?.message || ipv4Err) },
            null,
            2
          )
        );
      }
      // If fallback succeeds we already returned above; otherwise continue with existing handling
    }

    // Single consolidated log (respect log level + throttling for network)
    try {
      const logLevel = (
        process.env.SUPABASE_DASHBOARD_LOG_LEVEL || "warn"
      ).toLowerCase();
      const now = Date.now();
      const throttledNetwork =
        isNetwork &&
        lastDashboardNetworkLog &&
        now - lastDashboardNetworkLog <= 60_000; // within throttle window

      if (isNetwork && !throttledNetwork) {
        lastDashboardNetworkLog = now;
      }

      const payload = JSON.stringify(
        {
          author,
          message,
          status: e?.status,
          details: e?.details,
          hint: e?.hint,
          isNetwork,
          throttled: throttledNetwork,
          level: logLevel,
        },
        null,
        2
      );

      const emit = (lvl: string, msg: string, data: string) => {
        if (lvl === "error") console.error(msg, data);
        else if (lvl === "warn") console.warn(msg, data);
        else if (lvl === "info") console.info(msg, data);
        else if (lvl === "debug") console.debug(msg, data);
      };

      // Determine severity we use internally
      const internalSeverity = isNetwork ? "warn" : "error";

      // Mapping: we only emit if user's configured level is >= internalSeverity
      const order: Record<string, number> = {
        error: 4,
        warn: 3,
        info: 2,
        debug: 1,
      };
      const configured = order[logLevel] ?? 3; // default warn
      const needed = order[internalSeverity];

      if (!throttledNetwork && configured >= needed) {
        emit(
          internalSeverity,
          "Supabase RPC get_all_dashboard_stats failed",
          payload
        );
      } else if (isNetwork && !throttledNetwork && configured >= order.debug) {
        // Edge case: if configured level is very verbose but severity suppressed
        emit("debug", "Supabase RPC get_all_dashboard_stats (debug)", payload);
      }
    } catch (_) {}

    // If this is clearly a network failure, skip the fallback (it would also fail) and return offline mode immediately
    if (isNetwork) {
      try {
        const metaDiag = {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
          url_host: (() => {
            try {
              return process.env.NEXT_PUBLIC_SUPABASE_URL
                ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
                : null;
            } catch (_) {
              return "invalid-url";
            }
          })(),
          anon_len: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
          anon_suffix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-6)
            : null,
          timestamp: new Date().toISOString(),
        };
        console.warn(
          "Dashboard offline mode: network error detected, returning empty stats array",
          JSON.stringify(metaDiag, null, 2)
        );
      } catch (_) {
        console.warn(
          "Dashboard offline mode: network error detected, returning empty stats array"
        );
      }
      return [];
    }

    // Non-network (logical / permission / RPC) errors: attempt lightweight fallback
    try {
      let businesses: any[] = [];
      const { data: rawAll, error: rawErr } = await supabase
        .from("Businesses")
        .select("id, name, author, created_at")
        .order("created_at", { ascending: false });
      if (rawErr) throw rawErr;
      const filtered = (rawAll || []).filter((r: any) => r.author === author);
      try {
        console.info(
          "[diag:getDashboardStats:fallback]",
          JSON.stringify(
            {
              author,
              total_rows: rawAll?.length || 0,
              matching_rows: filtered.length,
              authors_present: Array.from(
                new Set((rawAll || []).map((r: any) => r.author || null))
              ).slice(0, 12),
            },
            null,
            2
          )
        );
      } catch (_) {}
      businesses = filtered;
      return (businesses || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        totalinvoices: 0,
        totalrevenue: 0,
        totalclients: 0,
        created_on: b.created_at,
      }));
    } catch (fallbackErr: any) {
      // Final log before surfacing error
      try {
        console.error(
          "Dashboard fallback query failed (non-network error path)",
          JSON.stringify(
            { message: String(fallbackErr?.message || fallbackErr) },
            null,
            2
          )
        );
      } catch (_) {}
      throw new Error(message || "Failed to load dashboard stats");
    }
  }
};
