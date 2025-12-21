import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Invoice Software for Cleaning Businesses - Recurring Billing | ZeroDue",
  description:
    "Invoice software for cleaning businesses. Automate recurring billing, manage multiple properties, service packages, and get paid on time. Perfect for house and commercial cleaners.",
  keywords: [
    "cleaning business invoice software",
    "cleaning service billing",
    "recurring cleaning invoices",
    "house cleaning invoicing",
    "commercial cleaning billing",
    "cleaning business software",
    "maid service invoicing",
    "janitorial invoice software",
  ],
  openGraph: {
    title:
      "Invoice Software for Cleaning Businesses - Recurring Billing | ZeroDue",
    description:
      "Automate recurring billing, manage multiple properties, and get paid on time. Built for cleaning services.",
    url: "https://www.zerodue.co/industries/cleaning",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/cleaning",
  },
};

export default function CleaningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
