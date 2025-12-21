import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - Guides, Tutorials & Support",
  description:
    "Get help with ZeroDue invoicing software. Find answers to common questions, step-by-step guides, video tutorials, and contact our support team.",
  keywords: [
    "invoicing help",
    "invoice software support",
    "billing help",
    "payment tracking help",
    "ZeroDue tutorials",
    "how to create invoice",
  ],
  openGraph: {
    title: "ZeroDue Help Center - Support & Tutorials",
    description:
      "Find answers, guides, and get support for ZeroDue invoicing software.",
    url: "https://www.zerodue.co/help",
  },
  alternates: {
    canonical: "https://www.zerodue.co/help",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
