import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserBusinesses } from "@/lib/actions/business.actions";

// Always render this page dynamically to reflect plan changes immediately
export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ from_guest?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const fromGuest = params.from_guest === "true";

  let businesses;
  try {
    businesses = await getUserBusinesses();
  } catch (error) {
    console.error("Error fetching businesses for redirection:", error);
    // If from guest flow, go to onboarding to process localStorage data
    if (fromGuest) {
      redirect("/dashboard/onboarding?from_guest=true");
    }
    redirect("/dashboard/business/new");
  }

  if (businesses && businesses.length > 0) {
    redirect(`/dashboard/business?business_id=${businesses[0].id}`);
  } else {
    // If from guest flow, go to onboarding to auto-create business from localStorage
    if (fromGuest) {
      redirect("/dashboard/onboarding?from_guest=true");
    }
    redirect("/dashboard/business/new");
  }
}
