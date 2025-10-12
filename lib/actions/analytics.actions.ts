"use server";
import { createSupabaseClient } from "@/lib/supabase";

export type RevenuePoint = { month: string; amount: number };
export type StatusSlice = { status: string; count: number; color?: string };

// Helper: month label like "Jan"
function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

// Build an array of month start dates for the last `months` months including current
function lastMonthStarts(months: number): Date[] {
  const out: Date[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = months - 1; i >= 0; i--) {
    out.push(new Date(start.getFullYear(), start.getMonth() - i, 1));
  }
  return out;
}

export async function getRevenueSeries(
  business_id: number,
  months = 6
): Promise<RevenuePoint[]> {
  const supabase = createSupabaseClient();
  const monthStarts = lastMonthStarts(months);
  const rangeStart = monthStarts[0];
  const rangeEnd = new Date(
    monthStarts[monthStarts.length - 1].getFullYear(),
    monthStarts[monthStarts.length - 1].getMonth() + 1,
    1
  );

  // Fetch paid invoices in range
  const { data, error } = await supabase
    .from("Invoices")
    .select("total, created_at")
    .eq("business_id", business_id)
    .eq("status", "paid")
    .gte("created_at", rangeStart.toISOString())
    .lt("created_at", rangeEnd.toISOString());

  if (error) throw new Error(error.message);

  // Group totals by target month index
  const buckets = new Array(monthStarts.length).fill(0);
  (data || []).forEach((row: any) => {
    const created = new Date(row.created_at);
    for (let i = 0; i < monthStarts.length; i++) {
      const start = monthStarts[i];
      const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      if (created >= start && created < next) {
        const val =
          typeof row.total === "number" ? row.total : parseFloat(row.total);
        buckets[i] += isNaN(val) ? 0 : val;
        break;
      }
    }
  });

  return monthStarts.map((d, idx) => ({
    month: monthLabel(d),
    amount: buckets[idx] || 0,
  }));
}

export async function getInvoiceStatusBreakdown(
  business_id: number,
  sinceDays = 90
): Promise<StatusSlice[]> {
  const supabase = createSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);

  const { data, error } = await supabase
    .from("Invoices")
    .select("status")
    .eq("business_id", business_id)
    .gte("created_at", since.toISOString());
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {
    paid: 0,
    pending: 0,
    overdue: 0,
    draft: 0,
  };
  (data || []).forEach((r: any) => {
    const s = String(r.status || "").toLowerCase();
    if (s in counts) counts[s] += 1;
  });

  // Map to display labels/colors used in the page
  const slices: StatusSlice[] = [
    { status: "Paid", count: counts.paid, color: "#10B981" },
    { status: "Pending", count: counts.pending, color: "#F59E0B" },
    { status: "Overdue", count: counts.overdue, color: "#EF4444" },
    { status: "Draft", count: counts.draft, color: "#6B7280" },
  ];
  return slices;
}

export async function getOverview(
  business_id: number,
  sinceDays = 30
): Promise<{
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
}> {
  const supabase = createSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);

  const { data, error } = await supabase
    .from("Invoices")
    .select("status, total")
    .eq("business_id", business_id)
    .gte("created_at", since.toISOString());
  if (error) throw new Error(error.message);

  const rows = data || [];
  const paid = rows.filter(
    (r: any) => String(r.status).toLowerCase() === "paid"
  ).length;
  const pending = rows.filter(
    (r: any) => String(r.status).toLowerCase() === "pending"
  ).length;
  const overdue = rows.filter(
    (r: any) => String(r.status).toLowerCase() === "overdue"
  ).length;
  const total = rows.length;
  const totalAmount = rows.reduce((sum: number, r: any) => {
    const val = typeof r.total === "number" ? r.total : parseFloat(r.total);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return { total, paid, pending, overdue, totalAmount };
}
