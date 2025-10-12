import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentPlan } from "@/lib/plan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    const plan = await getCurrentPlan();
    return NextResponse.json({ plan, userId: user?.id || null });
  } catch (e) {
    return NextResponse.json(
      { plan: "free_user", userId: null },
      { status: 200 }
    );
  }
}
