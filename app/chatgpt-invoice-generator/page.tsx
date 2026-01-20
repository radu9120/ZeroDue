import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "ChatGPT Invoice Generator Alternative | ZeroDue",
  description:
    "Looking for a ChatGPT invoice generator? ZeroDue is a purpose-built invoicing platform with templates, tracking, reminders, and payments. Create professional invoices in minutes.",
  keywords: [
    "chatgpt invoice generator",
    "ai invoice generator",
    "invoice generator alternative",
    "create invoice with ai",
    "professional invoice software",
    "invoice templates",
    "payment reminders",
  ],
  openGraph: {
    title: "ChatGPT Invoice Generator Alternative | ZeroDue",
    description:
      "Create professional invoices faster with ZeroDue. Templates, payment tracking, and automated reminders included.",
    type: "website",
    url: "https://www.zerodue.co/chatgpt-invoice-generator",
  },
  alternates: {
    canonical: "https://www.zerodue.co/chatgpt-invoice-generator",
  },
};

const highlights = [
  "Professional, brand-ready templates",
  "Automatic invoice numbering and tracking",
  "Built-in payment links and reminders",
  "Tax and currency support",
  "Secure PDF export and email delivery",
];

const comparison = [
  {
    label: "Structured invoices",
    zerodue: "Templates with totals, tax, and due dates",
    chatgpt: "Text output requires manual formatting",
  },
  {
    label: "Payment tracking",
    zerodue: "Open, paid, and overdue status",
    chatgpt: "No tracking or reminders",
  },
  {
    label: "Compliance",
    zerodue: "Consistent fields for audits and taxes",
    chatgpt: "Easy to miss required fields",
  },
  {
    label: "Delivery",
    zerodue: "Email + payment link in one click",
    chatgpt: "Manual copy/paste into docs",
  },
];

const steps = [
  {
    title: "Add your business and client",
    description:
      "Save details once. Reuse them in every invoice without retyping.",
  },
  {
    title: "Pick a template and add items",
    description: "Generate line items, taxes, and totals automatically.",
  },
  {
    title: "Send, track, and get paid",
    description: "Share a payment link and let reminders handle follow-ups.",
  },
];

const faqs = [
  {
    question: "Is ZeroDue an AI invoice generator?",
    answer:
      "ZeroDue uses smart automation to speed up invoicing, but it focuses on structured, compliant invoices rather than chat-based drafts.",
  },
  {
    question: "Can I still use ChatGPT with ZeroDue?",
    answer:
      "Yes. Many teams use ChatGPT for draft copy and ZeroDue to produce the final invoice, track payments, and send reminders.",
  },
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. You can start free and upgrade only when you need more volume or features.",
  },
];

export default function ChatGPTInvoiceGeneratorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 mb-6">
                <Sparkles className="w-4 h-4" />
                ChatGPT Invoice Generator Alternative
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Create invoices faster than ChatGPT
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto">
                ChatGPT can draft text, but it can’t build compliant invoices,
                track payments, or send reminders. ZeroDue is purpose-built for
                invoicing with templates, automation, and payment links.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/invoice-generator"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-8 py-4 font-semibold shadow-lg hover:bg-blue-700 transition"
                >
                  Try the Invoice Generator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 px-8 py-4 font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition"
                >
                  Start free
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                Why teams switch from ChatGPT to ZeroDue
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                    <p className="text-slate-700 dark:text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50 dark:bg-slate-800/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center">
                ChatGPT vs ZeroDue
              </h2>
              <div className="grid gap-6">
                {comparison.map((row) => (
                  <div
                    key={row.label}
                    className="grid md:grid-cols-3 gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
                  >
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {row.label}
                    </div>
                    <div className="text-slate-800 dark:text-slate-100">
                      <strong className="block text-emerald-600 dark:text-emerald-400">
                        ZeroDue
                      </strong>
                      {row.zerodue}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong className="block text-slate-500 dark:text-slate-400">
                        ChatGPT
                      </strong>
                      {row.chatgpt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center">
                Generate an invoice in minutes
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50 dark:bg-slate-800/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Secure and compliant
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Keep consistent records with required fields, tax lines, and
                  audit-ready numbering.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Save hours each month
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Stop copying AI output into docs. ZeroDue handles templates,
                  PDFs, and delivery automatically.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Built for getting paid
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Add payment links, automate reminders, and track every invoice
                  in one dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                Frequently asked questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6"
                  >
                    <summary className="cursor-pointer text-lg font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-linear-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to switch from ChatGPT to real invoicing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create professional invoices, send them instantly, and get paid
              faster with ZeroDue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools/invoice-generator"
                className="inline-flex items-center justify-center rounded-full bg-white text-blue-600 px-8 py-4 font-semibold shadow-lg hover:bg-blue-50 transition"
              >
                Create your first invoice
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/blog/why-zerodue-beats-ai-invoice-generators"
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-8 py-4 font-semibold text-white hover:bg-white/10 transition"
              >
                Read the AI comparison
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
