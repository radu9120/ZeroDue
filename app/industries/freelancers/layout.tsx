import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Software for Freelancers - Free Invoicing | ZeroDue",
  description:
    "The best free invoice software for freelancers. Create professional invoices, automate payment reminders, and get paid faster. No credit card required.",
  keywords: [
    "freelancer invoice software",
    "freelance invoicing",
    "invoice generator for freelancers",
    "freelancer billing",
    "self-employed invoice",
    "freelance invoice template",
    "freelancer payment tracking",
    "invoice app for freelancers",
  ],
  openGraph: {
    title: "Invoice Software for Freelancers - Free Invoicing | ZeroDue",
    description:
      "Create professional invoices in seconds. Automate payment reminders and get paid faster. Free for freelancers.",
    url: "https://www.zerodue.co/industries/freelancers",
    type: "website",
  },
  alternates: {
    canonical: "https://www.zerodue.co/industries/freelancers",
  },
};

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
