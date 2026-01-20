import Link from "next/link";
import { CheckCircle, ArrowRight, Zap, TrendingUp } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "ZeroDue vs FreshBooks: Which Invoice Software is Better?",
  description:
    "Compare ZeroDue and FreshBooks for freelancers and small businesses. See pricing, features, ease of use, and which platform gets you paid faster.",
  keywords: [
    "zerodue vs freshbooks",
    "freshbooks alternative",
    "invoice software comparison",
    "best invoicing software",
    "freelancer invoice tools",
  ],
  openGraph: {
    title: "ZeroDue vs FreshBooks Comparison",
    description:
      "Which invoicing platform is right for you? Compare features, pricing, and user experience.",
    type: "website",
    url: "https://www.zerodue.co/vs/freshbooks",
  },
  alternates: {
    canonical: "https://www.zerodue.co/vs/freshbooks",
  },
};

const comparison = [
  {
    category: "Focus",
    zerodue: "Pure invoicing with fast setup",
    freshbooks: "Full accounting suite with complexity",
  },
  {
    category: "Setup time",
    zerodue: "Under 5 minutes to first invoice",
    freshbooks: "30+ minutes to configure accounting",
  },
  {
    category: "Free tier",
    zerodue: "3 invoices/month forever free",
    freshbooks: "No free tier, 30-day trial only",
  },
  {
    category: "Starting price",
    zerodue: "£9.99/month unlimited invoices",
    freshbooks: "£15/month for 5 clients",
  },
  {
    category: "Invoice limits",
    zerodue: "Unlimited on all paid plans",
    freshbooks: "Limited by client count",
  },
  {
    category: "Payment reminders",
    zerodue: "Automated, customizable sequences",
    freshbooks: "Manual reminders on basic plan",
  },
  {
    category: "Best for",
    zerodue: "Freelancers, contractors, small teams",
    freshbooks: "Businesses needing full accounting",
  },
];

const zerodueWins = [
  {
    title: "Simpler and faster",
    description:
      "Create your first invoice in minutes, not hours. No accounting jargon or complex setup.",
  },
  {
    title: "More affordable",
    description:
      "Start free, then £9.99/month for unlimited invoices. FreshBooks charges £15+ and limits clients.",
  },
  {
    title: "Better automation",
    description:
      "Smart reminders on all plans. FreshBooks locks automation behind higher tiers.",
  },
  {
    title: "Focused features",
    description:
      "Built purely for invoicing. No bloat, no features you'll never use.",
  },
];

const freshbooksWins = [
  {
    title: "Full accounting",
    description:
      "If you need expense categorization, P&L reports, and tax filing integration, FreshBooks offers more.",
  },
  {
    title: "Established brand",
    description:
      "Been around since 2003 with extensive integrations and accountant partnerships.",
  },
];

export default function VsFreshBooksPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                ZeroDue vs FreshBooks
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto">
                Both platforms help you invoice clients. ZeroDue is simpler,
                faster, and built purely for invoicing. FreshBooks is full
                accounting software with more complexity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-8 py-4 font-semibold shadow-lg hover:bg-blue-700 transition"
                >
                  Try ZeroDue free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 px-8 py-4 font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center">
                Feature comparison
              </h2>
              <div className="grid gap-6">
                {comparison.map((row) => (
                  <div
                    key={row.category}
                    className="grid md:grid-cols-3 gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6"
                  >
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {row.category}
                    </div>
                    <div className="text-slate-800 dark:text-slate-100">
                      <strong className="block text-blue-600 dark:text-blue-400 mb-1">
                        ZeroDue
                      </strong>
                      {row.zerodue}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong className="block text-green-600 dark:text-green-400 mb-1">
                        FreshBooks
                      </strong>
                      {row.freshbooks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50 dark:bg-slate-800/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center">
                Why teams switch to ZeroDue
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {zerodueWins.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
                  >
                    <CheckCircle className="w-6 h-6 text-emerald-500 mb-3" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center">
                When FreshBooks makes sense
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {freshbooksWins.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6"
                  >
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-3" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50 dark:bg-slate-800/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                The bottom line
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-200 mb-8">
                <strong>Choose ZeroDue</strong> if you need fast, simple
                invoicing without accounting complexity. Perfect for
                freelancers, contractors, and small teams.
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-200 mb-8">
                <strong>Choose FreshBooks</strong> if you need full accounting
                features, expense management, and established integrations with
                banks and accountants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-8 py-4 font-semibold shadow-lg hover:bg-blue-700 transition"
                >
                  Start with ZeroDue free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
