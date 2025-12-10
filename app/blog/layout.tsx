import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoicing & Business Blog - Tips, Guides & Best Practices",
  description:
    "Expert guides on invoicing, payment collection, freelance business tips, and small business finance. Learn how to get paid faster and manage cash flow.",
  openGraph: {
    title: "ZeroDue Blog - Invoicing Tips & Business Guides",
    description:
      "Expert guides on invoicing, payment collection, and small business finance.",
    url: "https://www.zerodue.co/blog",
  },
  alternates: {
    canonical: "https://www.zerodue.co/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
