"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Download,
  Mail,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const features = [
  {
    icon: Zap,
    title: "Create in Seconds",
    description: "Professional invoices ready in under 60 seconds",
  },
  {
    icon: Mail,
    title: "Send Instantly",
    description: "Email invoices directly to clients with payment links",
  },
  {
    icon: CreditCard,
    title: "Accept Payments",
    description: "Get paid via credit card, bank transfer, or PayPal",
  },
  {
    icon: Sparkles,
    title: "Track Everything",
    description: "Know when invoices are opened and paid in real-time",
  },
];

const benefits = [
  "No credit card required",
  "Unlimited invoices",
  "Professional templates",
  "Automatic tax calculation",
  "Multi-currency support",
  "Payment reminders",
  "Client management",
  "Mobile friendly",
];

const comparisonData = [
  { feature: "Create invoices", free: true, paid: true },
  { feature: "Send via email", free: true, paid: true },
  { feature: "Professional templates", free: true, paid: true },
  { feature: "Accept online payments", free: false, paid: true },
  { feature: "Automatic reminders", free: false, paid: true },
  { feature: "Track payment status", free: false, paid: true },
  { feature: "Client portal", free: false, paid: true },
];

export default function InvoiceGeneratorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  Free Invoice Generator{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                    Online
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Create professional invoices in seconds. Send to clients via
                  email, accept online payments, and get paid faster. No Excel,
                  no Word—just click and create.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      Create Free Invoice
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button
                      size="lg"
                      variant="neutralOutline"
                      className="border-slate-300 dark:border-slate-600"
                    >
                      <Download className="mr-2 w-5 h-5" />
                      Download Template
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Free forever • No credit card • 2 minutes setup
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why Use an Online Invoice Generator?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Skip Excel and Word. Create, send, and track invoices online—all
                in one place.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits List */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                Everything You Need to Invoice Clients
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-slate-700 dark:text-slate-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                How to Generate an Invoice in 3 Steps
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Add Your Details
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Enter your business name, client info, services provided,
                      and amounts. Choose from professional templates that match
                      your brand.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Send to Client
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Email your invoice directly from ZeroDue with a payment
                      link. Clients can pay with credit card, bank transfer, or
                      PayPal with one click.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Get Paid Faster
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Track when your invoice is opened and paid. Automatic
                      reminders chase late payments for you. Get paid 40% faster
                      on average.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                Free vs Premium Invoice Generator
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 text-center">
                Start free, upgrade when you need more features
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-4 text-slate-900 dark:text-white font-semibold">
                        Feature
                      </th>
                      <th className="text-center p-4 text-slate-900 dark:text-white font-semibold">
                        Free
                      </th>
                      <th className="text-center p-4 text-slate-900 dark:text-white font-semibold">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 dark:border-slate-700"
                      >
                        <td className="p-4 text-slate-700 dark:text-slate-300">
                          {row.feature}
                        </td>
                        <td className="p-4 text-center">
                          {row.free ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Premium starts at just £5.58/month
                  </p>
                  <Link href="/pricing">
                    <Button variant="neutralOutline">View Pricing</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Creating Professional Invoices Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 10,000+ businesses using ZeroDue to create invoices, get paid
              faster, and grow their business.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8"
              >
                Create Your First Invoice Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
