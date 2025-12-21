import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Invoice Templates - Word, Excel & PDF | ZeroDue",
  description:
    "Download free professional invoice templates in Word, Excel, and PDF. Customizable templates for freelancers, contractors, and small businesses. No signup required.",
  keywords: [
    "free invoice template",
    "invoice template word",
    "invoice template excel",
    "invoice template pdf",
    "free invoice template download",
    "printable invoice template",
    "professional invoice template",
    "business invoice template",
    "freelancer invoice template",
    "contractor invoice template",
  ],
  openGraph: {
    title: "Free Invoice Templates - Word, Excel & PDF | ZeroDue",
    description:
      "Download professional invoice templates. Fully customizable and ready to use. No signup required.",
    url: "https://www.zerodue.co/templates",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/templates",
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
