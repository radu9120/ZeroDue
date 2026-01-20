import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { WebPageSchema, FAQSchema } from "@/components/seo/StructuredData";

export const metadata = {
  title: "Claude Invoice Generator Alternative | ZeroDue",
  description:
    "Looking for a Claude AI invoice generator? ZeroDue is purpose-built invoicing software with professional templates, tracking, automated reminders, and instant payments.",
  keywords: [
    "claude invoice generator",
    "claude ai invoice",
    "ai invoice generator",
    "invoice software alternative",
    "professional invoice templates",
    "automated invoice reminders",
  ],
  openGraph: {
    title: "Claude Invoice Generator Alternative | ZeroDue",
    description:
      "Professional invoicing software that beats AI generators. Templates, tracking, and payments included.",
    type: "website",
    url: "https://www.zerodue.co/claude-invoice-generator",
  },
  alternates: {
    canonical: "https://www.zerodue.co/claude-invoice-generator",
  },
};

const highlights = [
  "Pre-built templates for instant professional invoices",
  "Sequential numbering and audit-ready records",
  "Payment tracking with open/paid/overdue status",
  "Automated reminders that handle follow-ups",
  "Multi-currency and tax compliance built-in",
];

const comparison = [
  {
    label: "Invoice structure",
    zerodue: "Compliant templates with all required fields",
    claude: "Text output requiring manual formatting",
  },
  {
    label: "Payment collection",
    zerodue: "Embedded payment links and tracking",
    claude: "No payment processing",
  },
  {
    label: "Tax handling",
    zerodue: "Automatic VAT, GST, sales tax calculation",
    claude: "Manual tax calculations prone to errors",
  },
  {
    label: "Client management",
    zerodue: "Saved client profiles and recurring billing",
    claude: "Re-enter details every time",
  },
];

const steps = [
  {
    title: "Set up once",
    description:
      "Add your business details and client information. ZeroDue remembers everything for future invoices.",
  },
  {
    title: "Generate instantly",
    description:
      "Pick a template, add line items. Taxes and totals calculate automatically.",
  },
  {
    title: "Send and track",
    description:
      "Email with payment links. Track opens, payments, and get automatic reminders.",
  },
];

const faqs = [
  {
    question: "How is ZeroDue different from Claude AI for invoicing?",
    answer:
      "Claude generates text, but ZeroDue is built specifically for invoicing: compliant templates, automatic numbering, payment processing, reminders, and financial tracking. It's the difference between a drafting tool and a complete business system.",
  },
  {
    question: "Can I use Claude with ZeroDue?",
    answer:
      "Absolutely. Some users draft service descriptions in Claude, then paste them into ZeroDue to create the actual invoice with proper formatting, taxes, and payment links.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "Yes. Start with 3 free invoices per month. Upgrade to Professional (£9.99/month) for unlimited invoices or pay per invoice at £0.99 each.",
  },
];

export default function ClaudeInvoiceGeneratorPage() {
  return (
    <>
      <WebPageSchema
        name="Claude Invoice Generator Alternative | ZeroDue"
        description="Looking for Claude AI invoice generation? ZeroDue offers purpose-built invoicing with professional templates, payment tracking, and automated reminders."
        url="https://www.zerodue.co/claude-invoice-generator"
      />
      <FAQSchema
        faqs={faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/40 px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-300 mb-6">
                <Sparkles className="w-4 h-4" />
                Claude AI Invoice Alternative
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Turn AI drafts into real invoices
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto">
                Claude can help write descriptions, but it can't create
                compliant invoices, track payments, or send reminders. ZeroDue
                is purpose-built invoicing software that handles the entire
                billing process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white px-8 py-4 font-semibold shadow-lg hover:bg-purple-700 transition"
                >
                  Start free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/tools/invoice-generator"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 px-8 py-4 font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition"
                >
                  Try Invoice Generator
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                Why freelancers choose ZeroDue over Claude
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
                Claude AI vs ZeroDue
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
                        Claude AI
                      </strong>
                      {row.claude}
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
                How ZeroDue works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold mb-4">
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
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Audit-ready records
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Sequential numbering, required tax fields, and compliant
                  formatting for HMRC, IRS, and international regulations.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Stop manual follow-ups
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Automatic reminders 3 days before due date, on due date, and
                  for overdue invoices. Get paid 40% faster on average.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Real payment processing
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Clients click and pay instantly via credit card, bank
                  transfer, or PayPal. No separate payment tools needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                Common questions
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

        <section className="py-20 bg-linear-to-r from-purple-600 to-indigo-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready for real invoicing software?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Stop copying AI output. Create professional invoices, track
              payments, and get paid faster with ZeroDue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-white text-purple-600 px-8 py-4 font-semibold shadow-lg hover:bg-purple-50 transition"
              >
                Start free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/blog/why-zerodue-beats-ai-invoice-generators"
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-8 py-4 font-semibold text-white hover:bg-white/10 transition"
              >
                Read the comparison
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
