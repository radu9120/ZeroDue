import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserBusinesses } from "@/lib/actions/business.actions";

// Always render this page dynamically to reflect plan changes immediately
export const revalidate = 0;

export default async function Page() {
  const { userId } = await auth();
  console.log("DEBUG: userId from auth() =", userId);
  if (!userId) redirect("/sign-in");

  let businesses;
  try {
    businesses = await getUserBusinesses();
    console.log("DEBUG: businesses fetched =", businesses?.length);
  } catch (error) {
    console.error("Error fetching businesses for redirection:", error);
    redirect("/dashboard/business/new");
  }

  if (businesses && businesses.length > 0) {
    redirect(`/dashboard/business?business_id=${businesses[0].id}`);
  } else {
    redirect("/dashboard/business/new");
  }
}
