import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade Your Plan - Professional & Enterprise Plans",
  description:
    "Upgrade your ZeroDue plan for unlimited invoices, advanced features, priority support, and more. Compare Professional and Enterprise plans.",
  keywords: [
    "upgrade invoicing plan",
    "professional invoice software",
    "enterprise billing",
    "unlimited invoices",
  ],
  openGraph: {
    title: "Upgrade to ZeroDue Professional",
    description:
      "Unlock unlimited invoices and advanced features with our paid plans.",
    url: "https://www.zerodue.co/upgrade",
  },
  alternates: {
    canonical: "https://www.zerodue.co/upgrade",
  },
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
