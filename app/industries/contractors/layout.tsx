import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contractor Invoice Software - Billing for Construction | ZeroDue",
  description:
    "Invoice software built for contractors. Create estimates, track materials and labor, progress billing, and get paid faster. Perfect for construction professionals.",
  keywords: [
    "contractor invoice software",
    "construction invoicing",
    "contractor billing",
    "progress billing software",
    "construction estimate software",
    "job site invoicing",
    "contractor billing app",
    "construction payment tracking",
  ],
  openGraph: {
    title: "Contractor Invoice Software - Billing for Construction | ZeroDue",
    description:
      "From estimates to final payment—manage job invoicing, materials, and progress billing all in one place.",
    url: "https://www.zerodue.co/industries/contractors",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/contractors",
  },
};

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
