import FAQ from "@/components/faq";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Pricing, Security & Billing",
  description:
    "Get answers to common questions about ZeroDue invoicing software. Learn about pricing, security, billing workflows, payment methods, and how to get started.",
  openGraph: {
    title: "ZeroDue FAQ - Common Questions Answered",
    description:
      "Find answers about pricing, security, and billing with ZeroDue invoicing.",
    url: "https://www.zerodue.co/faq",
  },
  alternates: {
    canonical: "https://www.zerodue.co/faq",
  },
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <section className="pt-28 pb-10 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-300">
            Help Center
          </p>
          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
            Everything you need to know about ZeroDue&apos;s pricing, security,
            and billing workflows.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-white shadow-lg transition hover:bg-blue-500"
            >
              Talk to support →
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2.5 text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-200"
            >
              Browse product guides →
            </Link>
          </div>
        </div>
      </section>

      <FAQ />
    </main>
  );
}
