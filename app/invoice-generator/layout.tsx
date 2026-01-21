import { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title:
    "Free Invoice Generator - Create Professional Invoices Online | ZeroDue",
  description:
    "Create professional invoices in seconds with our free online invoice generator. No signup required. Add items, calculate totals, and download or send instantly. Perfect for freelancers, contractors, and small businesses.",
  keywords: [
    "invoice generator",
    "free invoice generator",
    "invoice maker",
    "create invoice online",
    "online invoice generator free",
    "professional invoice generator",
    "invoice template generator",
    "make invoice free",
    "invoice creator",
    "free invoicing tool",
    "invoice generator UK",
    "invoice generator no signup",
    "instant invoice generator",
    "small business invoice generator",
    "freelance invoice generator",
  ],
  alternates: {
    canonical: "https://www.zerodue.co/invoice-generator",
  },
  openGraph: {
    title: "Free Invoice Generator - Create Professional Invoices Online",
    description:
      "Create professional invoices in seconds. Free online invoice generator with no signup required. Perfect for freelancers and small businesses.",
    url: "https://www.zerodue.co/invoice-generator",
    type: "website",
    images: [
      {
        url: "https://www.zerodue.co/og-invoice-generator.png",
        width: 1200,
        height: 630,
        alt: "Free Invoice Generator - ZeroDue",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Invoice Generator - Create Professional Invoices",
    description:
      "Create professional invoices in seconds. Free, no signup required.",
    images: ["https://www.zerodue.co/og-invoice-generator.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function InvoiceGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
