import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Free Invoice Generator - Create Professional Invoices Online | ZeroDue",
  description:
    "Free online invoice generator. Create professional invoices in seconds, send via email, and accept online payments. No Excel or Word needed. Start for free.",
  keywords: [
    "free invoice generator",
    "invoice generator online",
    "create invoice free",
    "online invoice maker",
    "invoice generator no sign up",
    "professional invoice generator",
    "business invoice generator",
    "invoice creator",
    "make invoice online",
    "invoice builder",
  ],
  openGraph: {
    title:
      "Free Invoice Generator - Create Professional Invoices Online | ZeroDue",
    description:
      "Create professional invoices in seconds. Send via email and accept online payments. Free forever.",
    url: "https://www.zerodue.co/tools/invoice-generator",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/tools/invoice-generator",
  },
};

export default function InvoiceGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
