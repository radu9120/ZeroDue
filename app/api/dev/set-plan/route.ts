import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { normalizePlan, type AppPlan } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_DEV_SET_PLAN !== "true") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const { plan } = await req.json().catch(() => ({ plan: "" }));
  const p = normalizePlan(plan as string);
  if (!p) return new NextResponse("Bad Request", { status: 400 });
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { plan: p as AppPlan },
  });
  return NextResponse.json({ ok: true, plan: p });
}
