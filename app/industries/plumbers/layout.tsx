import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plumbing Invoice Software - Billing for Plumbers | ZeroDue",
  description:
    "Invoice software designed for plumbers. Create on-site invoices, track parts and labor, emergency call-out billing, and accept payments instantly.",
  keywords: [
    "plumber invoice software",
    "plumbing billing",
    "plumber invoicing app",
    "plumbing invoice template",
    "emergency plumber billing",
    "plumber payment app",
    "trade invoicing software",
    "plumbing business software",
  ],
  openGraph: {
    title: "Plumbing Invoice Software - Billing for Plumbers | ZeroDue",
    description:
      "Create invoices on the job site. Track parts, labor, and call-out fees. Get paid instantly.",
    url: "https://www.zerodue.co/industries/plumbers",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/plumbers",
  },
};

export default function PlumberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
