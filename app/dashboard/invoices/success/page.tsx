import { notFound } from "next/navigation";
import { getInvoicesByAuthor } from "@/lib/actions/invoice.actions";
import {
  getBusinessById,
  getUserBusinesses,
} from "@/lib/actions/business.actions";
import InvoiceSuccessView from "@/components/Invoices/InvoiceSuccessView";
import { getCurrentPlan } from "@/lib/plan";
import { DashboardShell } from "@/components/Business/ModernDashboard/DashboardShell";
import { revalidatePath } from "next/cache";

interface PageProps {
  searchParams: Promise<{
    business_id?: string;
    invoice_id?: string;
    edit?: string;
  }>;
}

export default async function InvoiceSuccessPage({ searchParams }: PageProps) {
  const { business_id, invoice_id, edit } = await searchParams;

  // Force revalidation of the plan to ensure UI is up to date after payment
  revalidatePath("/api/plan");
  revalidatePath("/dashboard");

  if (!business_id || !invoice_id) {
    notFound();
  }

  try {
    const [allInvoices, businessData, userPlan, allBusinesses] =
      await Promise.all([
        getInvoicesByAuthor(),
        getBusinessById(Number(business_id)),
        getCurrentPlan(),
        getUserBusinesses(),
      ]);

    const invoice = allInvoices.find(
      (inv) => String(inv.id) === String(invoice_id)
    );

    if (!invoice || !businessData) {
      notFound();
    }

    return (
      <DashboardShell
        business={businessData}
        allBusinesses={allBusinesses}
        activePage="invoices"
        userPlan={userPlan}
      >
        <InvoiceSuccessView
          invoice={invoice}
          company={businessData}
          editMode={edit === "1"}
          userPlan={userPlan}
        />
      </DashboardShell>
    );
  } catch (error) {
    console.error("Error fetching invoice:", error);
    notFound();
  }
}
