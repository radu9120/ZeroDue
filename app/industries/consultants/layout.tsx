import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Software for Consultants - Professional Billing | ZeroDue",
  description:
    "Consulting invoice software for professionals. Track hours, manage retainers, and bill clients professionally. Time tracking, project billing, and automated invoicing.",
  keywords: [
    "consultant invoice software",
    "consulting billing",
    "retainer invoicing",
    "hourly billing software",
    "consultant time tracking",
    "professional services invoicing",
    "consulting invoice template",
    "management consultant billing",
  ],
  openGraph: {
    title: "Invoice Software for Consultants - Professional Billing | ZeroDue",
    description:
      "Track hours, manage retainers, and invoice clients professionally. Built for consultants.",
    url: "https://www.zerodue.co/industries/consultants",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/consultants",
  },
};

export default function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
