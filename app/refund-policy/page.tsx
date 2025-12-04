import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Clock,
  CreditCard,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Refund Policy | ZeroDue",
  description: "ZeroDue 14-day money-back guarantee and refund policy",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  Refund Policy
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Last updated: December 2, 2025
                </p>
              </div>
            </div>
          </div>

          {/* 14-Day Guarantee Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 mb-12 text-white shadow-xl shadow-emerald-500/20">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-10 h-10" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  14-Day Money-Back Guarantee
                </h2>
                <p className="text-emerald-100 text-lg">
                  Not satisfied? Get a full refund within 14 days of purchase.
                  No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* Overview */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-500" />
                Overview
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                At ZeroDue, we want you to be completely satisfied with your
                purchase. If you&apos;re not happy with our service for any
                reason, you can request a full refund within{" "}
                <strong>14 days</strong> of your initial purchase date.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                This policy applies to all paid subscription plans (Professional
                and Enterprise) for both monthly and yearly billing periods.
              </p>
            </section>

            {/* Eligible for Refund */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Eligible for Refund
              </h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 mt-4 border border-emerald-100 dark:border-emerald-800">
                <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>
                      First-time subscription purchases within 14 days
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Monthly subscriptions (first month only)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Yearly subscriptions (full refund within 14 days)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Plan upgrades (within 14 days of upgrade)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Technical issues that prevent service usage</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Not Eligible for Refund */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                Not Eligible for Refund
              </h2>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mt-4 border border-red-100 dark:border-red-800">
                <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Requests made after 14 days from purchase date</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Recurring subscription renewals (cancel before renewal)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Invoice credit purchases (pay-as-you-go credits)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Accounts terminated for Terms of Service violations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Previously refunded subscriptions (one refund per
                      customer)
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* How to Request */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-500" />
                How to Request a Refund
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mt-4 border border-slate-200 dark:border-slate-700">
                <ol className="space-y-4 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">
                        Contact Support
                      </strong>
                      <p className="mt-1">
                        Email us at{" "}
                        <a
                          href="mailto:support@zerodue.co"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          support@zerodue.co
                        </a>{" "}
                        with the subject line &quot;Refund Request&quot;
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">
                        Provide Details
                      </strong>
                      <p className="mt-1">
                        Include your account email, purchase date, and reason
                        for the refund request
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">
                        Processing Time
                      </strong>
                      <p className="mt-1">
                        We&apos;ll review your request within 2-3 business days
                        and process approved refunds within 5-10 business days
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                      4
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">
                        Receive Refund
                      </strong>
                      <p className="mt-1">
                        Refunds are credited to the original payment method.
                        Your subscription will be cancelled upon refund.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </section>

            {/* Trial Period Note */}
            <section className="mb-10">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  💡 Free Trial Reminder
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Remember, all paid plans come with a{" "}
                  <strong>30-day free trial</strong>. You won&apos;t be charged
                  during the trial period, and you can cancel anytime before the
                  trial ends without any charge. The 14-day refund policy
                  applies to charges made after the trial period.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Questions?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                If you have any questions about our refund policy, please
                don&apos;t hesitate to contact us:
              </p>
              <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:support@zerodue.co"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    support@zerodue.co
                  </a>
                </li>
                <li>
                  Help Center:{" "}
                  <Link
                    href="/help"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Visit our Help Center
                  </Link>
                </li>
                <li>Dashboard Chat: Use the chat widget in your dashboard</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
