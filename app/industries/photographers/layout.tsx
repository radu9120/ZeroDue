import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Software for Photographers - Photography Billing | ZeroDue",
  description:
    "Invoice software for photographers. Session billing, photography packages, usage rights, deposit management, and print releases. Perfect for wedding and portrait photographers.",
  keywords: [
    "photographer invoice software",
    "photography billing",
    "wedding photographer invoicing",
    "photography invoice template",
    "photo session billing",
    "photographer payment app",
    "photography business software",
    "portrait photographer invoicing",
  ],
  openGraph: {
    title: "Invoice Software for Photographers - Photography Billing | ZeroDue",
    description:
      "From photoshoots to print sales—manage sessions, packages, and licensing with professional invoicing.",
    url: "https://www.zerodue.co/industries/photographers",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/photographers",
  },
};

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
