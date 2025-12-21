import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Free Estimate Generator - Create Professional Quotes Online | ZeroDue",
  description:
    "Free online estimate generator for contractors and service businesses. Create professional estimates, send for approval, and convert to invoices. Start for free.",
  keywords: [
    "free estimate generator",
    "estimate generator online",
    "quote generator",
    "estimate maker",
    "online estimate tool",
    "contractor estimate software",
    "project estimate generator",
    "estimate creator",
    "quote builder",
    "estimate calculator",
  ],
  openGraph: {
    title:
      "Free Estimate Generator - Create Professional Quotes Online | ZeroDue",
    description:
      "Create professional estimates in minutes. Send for approval and convert to invoices automatically.",
    url: "https://www.zerodue.co/tools/estimate-generator",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/tools/estimate-generator",
  },
};

export default function EstimateGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
