import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { normalizePlan } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    const raw = (user?.publicMetadata as any)?.plan || "free_user";
    const plan = normalizePlan(raw);
    return NextResponse.json({ plan });
  } catch (e) {
    return NextResponse.json({ plan: "free_user" }, { status: 200 });
  }
}
