import FAQ from "@/components/faq";
import { FAQSchema } from "@/components/seo/StructuredData";
import type { Metadata } from "next";
import Link from "next/link";

// FAQ data for structured data (must match the actual FAQ content)
const faqData = [
  {
    question: "How does the free plan work?",
    answer:
      "Our free plan includes 3 invoices per month, basic templates, and essential features. Perfect for testing the platform or very small businesses. You can upgrade anytime as your needs grow.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time with no penalties. Your account will remain active until the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Absolutely. We use bank-level 256-bit SSL encryption for all data transmission and storage. Our infrastructure is compliant with GDPR, SOC 2, and PCI DSS standards.",
  },
  {
    question: "Can I customize invoice templates?",
    answer:
      "Yes! All paid plans include fully customizable templates. Add your logo, change colors, modify layouts, and create your own templates from scratch.",
  },
  {
    question: "Do you offer multi-currency support?",
    answer:
      "Professional and Enterprise plans include multi-currency support with automatic exchange rate updates.",
  },
  {
    question: "How do automated reminders work?",
    answer:
      "You can set up automatic email reminders to be sent before and after invoice due dates. This feature reduces late payments by an average of 40%.",
  },
  {
    question: "Can I add team members?",
    answer:
      "Yes! Professional plans include 2 team member seats, and Enterprise plans include up to 4 seats with different permission levels.",
  },
  {
    question: "What if I need help or have questions?",
    answer:
      "Free users get email support with 48-hour response time. Paid plans get priority support with faster response times and live chat for Enterprise customers.",
  },
  {
    question: "Do you have an AI assistant?",
    answer:
      "Yes! ZeroDue includes a smart AI assistant available 24/7. Click the chat icon to get instant help with creating invoices, understanding features, or troubleshooting issues.",
  },
];

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
    <>
      <FAQSchema faqs={faqData} />
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
              Everything you need to know about ZeroDue&apos;s pricing,
              security, and billing workflows.
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
    </>
  );
}
