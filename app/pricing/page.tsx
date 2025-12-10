import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pricing - Free & Professional Plans",
  description:
    "Simple, transparent pricing for ZeroDue invoicing software. Start free forever, upgrade when you need more. No hidden fees, cancel anytime.",
  openGraph: {
    title: "ZeroDue Pricing - Free Invoice Software",
    description:
      "Start invoicing for free. Upgrade to Professional for unlimited invoices and advanced features.",
    url: "https://www.zerodue.co/pricing",
  },
  alternates: {
    canonical: "https://www.zerodue.co/pricing",
  },
};

export default function PricingPage() {
  // Redirect to upgrade page which has the full pricing UI
  redirect("/upgrade");
}
