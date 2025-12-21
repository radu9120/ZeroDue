import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - How We Use Cookies",
  description:
    "Learn about the cookies ZeroDue uses to improve your experience. Manage your cookie preferences and understand how we track website usage.",
  openGraph: {
    title: "ZeroDue Cookie Policy",
    description: "How we use cookies to improve your experience.",
    url: "https://www.zerodue.co/cookies",
  },
  alternates: {
    canonical: "https://www.zerodue.co/cookies",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
