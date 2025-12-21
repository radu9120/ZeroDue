import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Software for Landscapers - Lawn Care Billing | ZeroDue",
  description:
    "Invoice software for landscaping and lawn care businesses. Property-based billing, seasonal services, recurring maintenance, and material tracking. Perfect for landscapers.",
  keywords: [
    "landscaping invoice software",
    "lawn care billing",
    "landscaper invoicing app",
    "landscape design billing",
    "lawn maintenance invoicing",
    "landscaping business software",
    "gardening invoice software",
    "tree service billing",
  ],
  openGraph: {
    title: "Invoice Software for Landscapers - Lawn Care Billing | ZeroDue",
    description:
      "From lawn care to landscape design—manage properties, track materials, and bill seasonally.",
    url: "https://www.zerodue.co/industries/landscaping",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/landscaping",
  },
};

export default function LandscapingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
