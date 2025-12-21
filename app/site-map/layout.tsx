import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Map - All Pages & Navigation",
  description:
    "Complete site map of ZeroDue invoicing software. Find all pages including dashboard, invoicing tools, pricing, help center, and more.",
  openGraph: {
    title: "ZeroDue Site Map - Complete Navigation",
    description: "Find all pages and features of ZeroDue invoicing software.",
    url: "https://www.zerodue.co/site-map",
  },
  alternates: {
    canonical: "https://www.zerodue.co/site-map",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SiteMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
