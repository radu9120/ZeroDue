import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Free - Start Invoicing in Minutes",
  description:
    "Create your free ZeroDue account and start sending professional invoices today. No credit card required. Get paid faster with automated reminders.",
  keywords: [
    "free invoicing",
    "create invoice account",
    "invoice software signup",
    "free billing software",
    "freelancer invoice tool",
  ],
  openGraph: {
    title: "Sign Up for ZeroDue - Free Invoice Software",
    description:
      "Create your free account and start sending professional invoices in minutes.",
    url: "https://www.zerodue.co/sign-up",
    images: [
      {
        url: "https://www.zerodue.co/og-cover.png",
        width: 1200,
        height: 630,
        alt: "ZeroDue - Start Invoicing for Free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up for ZeroDue - Free Invoice Software",
    description:
      "Create your free account and start sending professional invoices.",
    images: ["https://www.zerodue.co/og-cover.png"],
  },
  alternates: {
    canonical: "https://www.zerodue.co/sign-up",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
