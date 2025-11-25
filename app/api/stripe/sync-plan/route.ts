import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizePlan } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// This endpoint syncs the user's plan from Stripe subscriptions to Supabase
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // Get user email to find their Stripe customer
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = userData.user.email;

    // Find customer in Stripe by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      // No Stripe customer, user is on free plan
      return NextResponse.json({
        plan: "free_user",
        message: "No Stripe customer found, user is on free plan",
      });
    }

    const customerId = customers.data[0].id;

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all", // Include trialing
      limit: 10,
    });

    // Find active or trialing subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    let plan = "free_user";

    if (activeSubscription) {
      // Get plan from subscription metadata or infer from product
      plan = activeSubscription.metadata?.plan || "professional";

      // If no metadata, try to infer from product name
      if (!activeSubscription.metadata?.plan) {
        const item = activeSubscription.items.data[0];
        if (item) {
          const product = await stripe.products.retrieve(
            item.price.product as string
          );
          if (product.name.toLowerCase().includes("enterprise")) {
            plan = "enterprise";
          } else if (product.name.toLowerCase().includes("professional")) {
            plan = "professional";
          }
        }
      }
    }

    const normalizedPlan = normalizePlan(plan);

    // Update user metadata in Supabase
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          plan: normalizedPlan,
          stripe_customer_id: customerId,
          subscription_id: activeSubscription?.id,
          subscription_status: activeSubscription?.status,
          plan_synced_at: new Date().toISOString(),
        },
      }
    );

    if (updateError) {
      console.error("Failed to update user plan:", updateError);
      return NextResponse.json(
        { error: "Failed to update plan" },
        { status: 500 }
      );
    }

    // Revalidate dashboard paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/plan");
    revalidatePath("/dashboard/business");

    return NextResponse.json({
      success: true,
      plan: normalizedPlan,
      subscription_status: activeSubscription?.status || "none",
      message: `Plan synced to ${normalizedPlan}`,
    });
  } catch (error: any) {
    console.error("Sync plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync plan" },
      { status: 500 }
    );
  }
}

// GET endpoint to check current status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: userData } = await supabase.auth.admin.getUserById(userId);

    const userMetadata = userData?.user?.user_metadata || {};
    const email = userData?.user?.email;

    // Also check Stripe
    let stripeInfo: any = null;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: "all",
          limit: 5,
        });
        stripeInfo = {
          customerId: customers.data[0].id,
          subscriptions: subscriptions.data.map((sub) => ({
            id: sub.id,
            status: sub.status,
            plan: sub.metadata?.plan,
            created: new Date(sub.created * 1000).toISOString(),
          })),
        };
      }
    }

    return NextResponse.json({
      userId,
      email,
      supabase_plan: userMetadata.plan || "free_user",
      supabase_metadata: userMetadata,
      stripe: stripeInfo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
