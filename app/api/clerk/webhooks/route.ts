import { NextRequest, NextResponse } from "next/server";
import { clerkClient as getClerkClient } from "@clerk/nextjs/server";
import { normalizePlan, type AppPlan } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Webhook } from "svix";

// Verify with Svix signature if CLERK_WEBHOOK_SECRET is set
async function verifyAndParse(req: NextRequest): Promise<any> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const skipVerify = process.env.SKIP_WEBHOOK_VERIFY === "true";
  const payload = await req.text();
  if (skipVerify || !secret) {
    // Fall back to parsing when no secret configured (dev)
    return JSON.parse(payload || "{}");
  }

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  } as const;

  const wh = new Webhook(secret);
  const evt = wh.verify(payload, svixHeaders);
  return evt;
}

function safeGet<T = unknown>(obj: any, path: string[]): T | undefined {
  try {
    return path.reduce<any>(
      (acc, key) => (acc == null ? undefined : acc[key]),
      obj
    ) as T | undefined;
  } catch {
    return undefined;
  }
}

function extractUserId(body: any): string | undefined {
  const candidates: Array<unknown> = [
    body?.data?.user_id,
    body?.data?.userId,
    body?.data?.user?.id,
    body?.actor?.id,
    safeGet(body, ["data", "subscription", "user_id"]),
    safeGet(body, ["data", "customer", "user_id"]),
    // Payer-based shapes
    safeGet(body, ["data", "payer", "user_id"]),
    safeGet(body, ["data", "payer_id"]),
    safeGet(body, ["data", "payer", "id"]),
    safeGet(body, ["data", "subscription", "payer_id"]),
    safeGet(body, ["data", "subscription", "payer", "id"]),
    safeGet(body, ["data", "customer", "id"]),
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.startsWith("user_")) return c;
  }
  return undefined;
}

function extractEmail(body: any): string | undefined {
  const candidates: Array<unknown> = [
    body?.data?.email,
    body?.data?.email_address,
    safeGet(body, ["data", "user", "email_address"]),
    safeGet(body, ["data", "user", "primary_email_address", "email_address"]),
    // customer/payer shapes
    safeGet(body, ["data", "customer", "email"]),
    safeGet(body, ["data", "payer", "email"]),
    // nested arrays of email addresses
    safeGet(body, [
      "data",
      "user",
      "email_addresses",
      0 as any,
      "email_address",
    ]),
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) return c;
  }
  return undefined;
}

function extractPlanName(body: any): string | undefined {
  return (
    // Common Clerk Billing payload shapes
    body?.data?.plan ||
    body?.data?.plan_name ||
    body?.data?.plan_slug ||
    // Explicitly handle array of items (e.g., subscription.created)
    safeGet(body, ["data", "items", 0 as any, "plan", "name"]) ||
    safeGet(body, ["data", "items", 0 as any, "plan", "slug"]) ||
    safeGet(body, ["data", "items", 0 as any, "price", "product", "name"]) ||
    safeGet(body, ["data", "items", 0 as any, "price", "product", "slug"]) ||
    safeGet(body, ["data", "items", 0 as any, "product", "name"]) ||
    safeGet(body, ["data", "items", 0 as any, "product", "slug"]) ||
    safeGet(body, ["data", "subscription", "plan", "name"]) ||
    safeGet(body, ["data", "subscription", "plan", "slug"]) ||
    safeGet(body, ["data", "subscription", "price", "product", "name"]) ||
    safeGet(body, ["data", "subscription", "price", "product", "slug"]) ||
    safeGet(body, ["data", "subscriptionItem", "plan", "name"]) ||
    safeGet(body, ["data", "subscriptionItem", "plan", "slug"]) ||
    safeGet(body, ["data", "subscriptionItem", "price", "product", "name"]) ||
    safeGet(body, ["data", "subscriptionItem", "price", "product", "slug"]) ||
    safeGet(body, ["data", "subscription_item", "plan", "name"]) ||
    safeGet(body, ["data", "subscription_item", "plan", "slug"]) ||
    safeGet(body, ["data", "subscription_item", "price", "product", "name"]) ||
    safeGet(body, ["data", "subscription_item", "price", "product", "slug"]) ||
    safeGet(body, ["data", "product", "name"]) ||
    safeGet(body, ["data", "product", "slug"]) ||
    safeGet(body, ["data", "price", "product", "name"]) ||
    safeGet(body, ["data", "price", "product", "slug"]) ||
    safeGet(body, ["data", "tier"]) ||
    undefined
  );
}

function decidePlanUpdate(
  eventTypeRaw: string,
  planName?: string
): { update: boolean; plan?: AppPlan } {
  const type = (eventTypeRaw || "").toLowerCase();
  const name = (planName || "").toLowerCase();

  // Cancellation-related events -> downgrade to free
  if (
    type.includes("canceled") ||
    type.includes("cancelled") ||
    type.includes("ended") ||
    type.includes("abandoned")
  ) {
    return { update: true, plan: "free_user" };
  }

  // Non-terminal states should not change plan
  if (
    type.includes("pastdue") ||
    type.includes("incomplete") ||
    type.includes("freetrialending") ||
    type.includes("upcoming") ||
    type.endsWith(".active")
  ) {
    // If we have a valid name, we can still set it; otherwise skip
    if (!name) return { update: false };
  }

  // Map recognizable plan names
  if (name.includes("free")) return { update: true, plan: "free_user" };
  if (name.includes("pro") || name.includes("professional"))
    return { update: true, plan: "professional" };
  if (name.includes("enterprise")) return { update: true, plan: "enterprise" };

  // subscription.created/updated without name: skip (do not overwrite)
  return { update: false };
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await verifyAndParse(req);
  } catch (e) {
    return new NextResponse("Bad signature or payload", { status: 400 });
  }

  const eventType: string = body?.type || body?.event || "";
  let userId = extractUserId(body);
  // Dev-only override: allow ?userId= or x-user-id header when verification is skipped
  if (!userId && process.env.SKIP_WEBHOOK_VERIFY === "true") {
    userId =
      req.nextUrl.searchParams.get("userId") ||
      req.headers.get("x-user-id") ||
      undefined;
  }
  // Fallback: resolve by email if available and signature verified
  if (!userId) {
    try {
      const email = extractEmail(body);
      if (email) {
        const client = await getClerkClient();
        const users = await client.users.getUserList({ emailAddress: [email] });
        if (Array.isArray(users) && users.length === 1) {
          userId = users[0].id;
        }
      }
    } catch (lookupErr) {
      // best-effort fallback; continue gracefully
    }
  }
  const planName = extractPlanName(body);
  if (!userId) {
    console.warn("Clerk webhook: missing userId in payload", {
      eventType,
      body,
    });
    return NextResponse.json({ received: true, skipped: "no-user" });
  }

  try {
    const decision = decidePlanUpdate(eventType, planName);
    if (!decision.update || !decision.plan) {
      return NextResponse.json({
        received: true,
        skipped: "no-change",
        userId,
      });
    }
    const client = await getClerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { plan: normalizePlan(decision.plan) },
    });

    // Revalidate key pages so UI updates promptly
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/business");
    revalidatePath("/dashboard/invoices");

    return NextResponse.json({ received: true, plan: decision.plan, userId });
  } catch (e) {
    console.error("Clerk webhook handling failed", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
