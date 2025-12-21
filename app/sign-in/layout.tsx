import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Access Your Invoicing Dashboard",
  description:
    "Sign in to your ZeroDue account to manage invoices, track payments, and access your business dashboard. Secure login with email or Google.",
  openGraph: {
    title: "Sign In to ZeroDue",
    description: "Access your professional invoicing dashboard.",
    url: "https://www.zerodue.co/sign-in",
  },
  alternates: {
    canonical: "https://www.zerodue.co/sign-in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
