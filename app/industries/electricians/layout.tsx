import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electrician Invoice Software - Billing for Electricians | ZeroDue",
  description:
    "Invoice software designed for electricians. Create on-site invoices, track materials and labor, attach certificates, and accept payments instantly.",
  keywords: [
    "electrician invoice software",
    "electrical billing",
    "electrician invoicing app",
    "electrical invoice template",
    "electrician payment app",
    "sparky invoice software",
    "trade invoicing software",
    "electrical business software",
  ],
  openGraph: {
    title: "Electrician Invoice Software - Billing for Electricians | ZeroDue",
    description:
      "Create professional invoices for every job. Track materials, attach certificates, and get paid faster.",
    url: "https://www.zerodue.co/industries/electricians",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/electricians",
  },
};

export default function ElectricianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
