import { notFound } from "next/navigation";
import { getInvoicesByAuthor } from "@/lib/actions/invoice.actions";
import { getBusinessById } from "@/lib/actions/business.actions";
import InvoiceSuccessView from "@/components/Invoices/InvoiceSuccessView";
import { Suspense } from "react";
import { getCurrentPlan } from "@/lib/plan";

interface PageProps {
  searchParams: Promise<{
    business_id?: string;
    invoice_id?: string;
    edit?: string;
  }>;
}

export default async function InvoiceSuccessPage({ searchParams }: PageProps) {
  const { business_id, invoice_id, edit } = await searchParams;

  if (!business_id || !invoice_id) {
    notFound();
  }

  try {
    const [allInvoices, businessData, userPlan] = await Promise.all([
      getInvoicesByAuthor(),
      getBusinessById(Number(business_id)),
      getCurrentPlan(),
    ]);

    const invoice = allInvoices.find(
      (inv) => String(inv.id) === String(invoice_id)
    );

    if (!invoice || !businessData) {
      notFound();
    }

    return (
      <Suspense fallback={null}>
        <InvoiceSuccessView
          invoice={invoice}
          company={businessData}
          editMode={edit === "1"}
          userPlan={userPlan}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error fetching invoice:", error);
    notFound();
  }
}
