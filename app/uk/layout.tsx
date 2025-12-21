import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Invoice Software - VAT Compliant Invoicing | ZeroDue",
  description:
    "Create HMRC-compliant invoices with automatic VAT calculation. Perfect for UK sole traders, limited companies, and contractors. Making Tax Digital ready.",
  keywords: [
    "UK invoice software",
    "VAT invoice software",
    "HMRC compliant invoicing",
    "Making Tax Digital",
    "UK invoicing software",
    "VAT calculator UK",
    "CIS invoice software",
    "UK small business invoicing",
    "limited company invoicing",
    "UK sole trader invoicing",
  ],
  openGraph: {
    title: "UK Invoice Software - VAT Compliant Invoicing | ZeroDue",
    description:
      "Create HMRC-compliant invoices with automatic VAT calculation. Making Tax Digital ready.",
    url: "https://www.zerodue.co/uk",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/uk",
  },
};

export default function UKLayout({ children }: { children: React.ReactNode }) {
  return children;
}
