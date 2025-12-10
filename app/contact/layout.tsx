import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get Support & Help",
  description:
    "Get in touch with the ZeroDue team. We're here to help with any questions about invoicing, billing, or your account. Fast, friendly support.",
  openGraph: {
    title: "Contact ZeroDue - Get Support",
    description:
      "Get in touch with the ZeroDue team for any questions or support.",
    url: "https://www.zerodue.co/contact",
  },
  alternates: {
    canonical: "https://www.zerodue.co/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
