"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  CheckCircle,
  ArrowRight,
  PoundSterling,
  Building2,
  FileText,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const ukFeatures = [
  {
    icon: PoundSterling,
    title: "VAT Compliant",
    description:
      "Automatic VAT calculation at 20%, 5%, or 0%. HMRC-compliant invoices.",
  },
  {
    icon: Receipt,
    title: "VAT Returns Ready",
    description:
      "Track VAT collected and paid. Export data for Making Tax Digital (MTD).",
  },
  {
    icon: FileText,
    title: "CIS Deductions",
    description:
      "Construction Industry Scheme deductions calculated automatically.",
  },
  {
    icon: Building2,
    title: "UK Business Details",
    description:
      "Company number, VAT number, and registered office address fields.",
  },
];

const vatRates = [
  {
    rate: "20%",
    name: "Standard Rate",
    description: "Most goods and services",
  },
  {
    rate: "5%",
    name: "Reduced Rate",
    description: "Energy-saving materials, children's car seats",
  },
  {
    rate: "0%",
    name: "Zero Rate",
    description: "Books, newspapers, children's clothing",
  },
];

const benefits = [
  "HMRC-compliant invoice templates",
  "Automatic VAT calculation",
  "Making Tax Digital (MTD) ready",
  "CIS deduction support",
  "Reverse charge VAT",
  "Multiple VAT rates",
  "UK bank account details",
  "Limited company fields",
];

export default function UKPage() {
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
                <div className="flex items-center justify-center gap-2 mb-6">
                  <MapPin className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl">🇬🇧</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  UK Invoice Software{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                    VAT Compliant
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  Create HMRC-compliant invoices with automatic VAT calculation.
                  Perfect for UK sole traders, limited companies, and
                  contractors. Making Tax Digital ready.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="neutralOutline"
                      className="border-slate-300 dark:border-slate-600"
                    >
                      View UK Pricing
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Free forever • No credit card • HMRC compliant
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* UK Features */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Built for UK Businesses
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Everything you need to invoice clients in the UK, from VAT to
                CIS deductions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {ukFeatures.map((feature, index) => (
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

        {/* VAT Rates */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                All UK VAT Rates Supported
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {vatRates.map((vat, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm text-center"
                  >
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {vat.rate}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {vat.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {vat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                HMRC-Compliant Invoicing Made Easy
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

        {/* Sample Invoice */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                UK-Compliant Invoice Example
              </h2>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Smith & Co Ltd
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        123 High Street, London, SW1A 1AA
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Company No: 12345678
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        VAT No: GB123456789
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Invoice No: INV-2025-001
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Date: 20 Dec 2025
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Bill To:
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    ABC Corporation Ltd
                    <br />
                    456 Business Park, Manchester, M1 1AA
                  </p>
                </div>

                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 text-slate-900 dark:text-white">
                        Description
                      </th>
                      <th className="text-right py-2 text-slate-900 dark:text-white">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        Website Development
                      </td>
                      <td className="text-right text-slate-900 dark:text-white">
                        £2,500.00
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        SEO Optimization
                      </td>
                      <td className="text-right text-slate-900 dark:text-white">
                        £750.00
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Subtotal
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      £3,250.00
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      VAT (20%)
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      £650.00
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      £3,900.00
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Payment due within 30 days. Please include invoice number
                    with payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Invoicing UK Clients Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of UK businesses using ZeroDue for VAT-compliant
              invoicing.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8"
              >
                Create Your First UK Invoice Free
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
