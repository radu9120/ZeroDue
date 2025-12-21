import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - How We Protect Your Data",
  description:
    "Learn how ZeroDue protects your data. Our privacy policy explains data collection, usage, storage, and your rights under GDPR and other regulations.",
  openGraph: {
    title: "ZeroDue Privacy Policy",
    description: "How we protect your data and respect your privacy.",
    url: "https://www.zerodue.co/privacy-policy",
  },
  alternates: {
    canonical: "https://www.zerodue.co/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
