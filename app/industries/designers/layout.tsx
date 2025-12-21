import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Software for Designers - Creative Billing | ZeroDue",
  description:
    "Invoice software built for graphic designers, brand designers, and creatives. Project billing, milestone payments, revision tracking, and beautiful invoices.",
  keywords: [
    "designer invoice software",
    "graphic designer invoicing",
    "creative billing",
    "design invoice template",
    "freelance designer billing",
    "brand designer invoicing",
    "design project billing",
    "creative invoice app",
  ],
  openGraph: {
    title: "Invoice Software for Designers - Creative Billing | ZeroDue",
    description:
      "Beautiful invoices for beautiful work. Bill by project, track revisions, and get paid for your creativity.",
    url: "https://www.zerodue.co/industries/designers",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/designers",
  },
};

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
